#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum VaultError {
    NotAdmin,
    PoolAlreadyExist,
    PoolNotFound,
    AmountIsZero,
    TransferError,
}

#[ink::contract]
pub mod vault {
    use ink::storage::Mapping;
    use psp22::PSP22;
    use ink::contract_ref;
    use ink::prelude::vec::Vec;

    use crate::VaultError;

    #[ink(storage)]
    pub struct Vault {
        admin: AccountId,
        // (asset, user, position) => Balance
        balances: Mapping<(AccountId, AccountId, u8), Balance>,
        pools: Vec<AccountId>,
    }

    impl Vault {
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();

            Self {
                admin: caller,
                balances: Default::default(),
                pools: Default::default()
            }
        }

        #[ink(message)]
        pub fn user_collateral(&mut self, asset: AccountId, user: AccountId, id: u8) -> Option<Balance> {
            self.balances.get((asset, user, id))
        }

        #[ink(message)]
        pub fn deposit(&mut self, asset: AccountId, user: AccountId, id: u8, amount: Balance) -> Result<(), VaultError> {
            let caller = self.env().caller();
            let contract = self.env().account_id();

            if self.pools.contains(&caller) {
                return Err(VaultError::PoolNotFound);
            }

            if amount <= 0 {
                return Err(VaultError::AmountIsZero);   
            }

            let mut token: contract_ref!(PSP22) = asset.into();
            token.transfer_from(caller, contract, amount, Vec::new()).map_err(|_| VaultError::TransferError)?;
            self.balances.insert((asset, user, id), &amount);

            return Ok(());
        }

        #[ink(message)]
        pub fn withdraw(&mut self, asset: AccountId, user: AccountId, id: u8, amount: Balance, receiver: AccountId) -> Result<(), VaultError> {
            let caller = self.env().caller();

            if self.pools.contains(&caller) {
                return Err(VaultError::PoolNotFound);
            }

            if amount <= 0 {
                return Err(VaultError::AmountIsZero);   
            }

            let mut token: contract_ref!(PSP22) = asset.into();
            token.transfer(receiver, amount, Vec::new()).map_err(|_| VaultError::TransferError)?;
            self.balances.remove((asset, user, id));

            return Ok(());
        }

        #[ink(message)]
        pub fn add_pool(&mut self, pool: AccountId) -> Result<(), VaultError> {
            let caller = self.env().caller();

            if caller == self.admin {
                return Err(VaultError::NotAdmin);
            }

            if !self.pools.contains(&caller) {
                return Err(VaultError::PoolAlreadyExist);
            }
                
            self.pools.push(pool);

            Ok(())
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    pub mod e2e_tests {
        use psp22::TokenRef;

        type E2EResult<T> = Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn test_constructor(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            let constructor = TokenRef::new(500, None, None, 0);
            let _token: AccountId = client
                .instantiate("token", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("Instantiate failed")
                .account_id;

            Ok(())
        }
    }
}