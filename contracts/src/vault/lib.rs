#![cfg_attr(not(feature = "std"), no_std, no_main)]

mod errors;
mod traits;

pub use errors::VaultError;
pub use traits::CollateralVault;

pub use self::vault::VaultRef;

#[ink::contract]
mod vault {
    use crate::CollateralVault;
    use ink::contract_ref;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use psp22::PSP22;

    use crate::VaultError;

    #[ink(storage)]
    pub struct Vault {
        admin: AccountId,
        // (market, user, position) => (balance, collateral asset)
        balances: Mapping<(AccountId, AccountId, u128), (Balance, AccountId)>,
        markets: Vec<AccountId>,
        assets: Vec<AccountId>,
    }

    impl Vault {
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();

            Self {
                admin: caller,
                balances: Default::default(),
                markets: Default::default(),
                assets: Default::default(),
            }
        }
    }

    impl CollateralVault for Vault {
        #[ink(message)]
        fn user_collateral(
            &self,
            market: AccountId,
            user: AccountId,
            id: u128,
        ) -> Option<(Balance, AccountId)> {
            self.balances.get((market, user, id))
        }

        #[ink(message)]
        fn supported_collateral_assets(&self) -> Vec<AccountId> {
            self.assets.clone()
        }

        #[ink(message)]
        fn markets_with_access(&self) -> Vec<AccountId> {
            self.markets.clone()
        }

        #[ink(message)]
        fn deposit(
            &mut self,
            user: AccountId,
            id: u128,
            collateral_asset: AccountId,
            collateral_amount: Balance,
        ) -> Result<(), VaultError> {
            let market = self.env().caller();
            let contract = self.env().account_id();

            if !self.markets.contains(&market) {
                return Err(VaultError::MarketNotFound);
            }

            if !self.assets.contains(&collateral_asset) {
                return Err(VaultError::AssetNotFound);
            }

            if collateral_amount <= 0 {
                return Err(VaultError::AmountIsZero);
            }

            let (collateral_balance, prev_collateral_asset) = self
                .balances
                .get((market, user, id))
                .unwrap_or_else(|| (0, AccountId::from([0; 32])));

            if prev_collateral_asset != AccountId::from([0; 32])
                && prev_collateral_asset != collateral_asset
            {
                return Err(VaultError::DifferentCollateralAsset);
            }

            let mut token: contract_ref!(PSP22) = collateral_asset.into();
            token
                .transfer_from(market, contract, collateral_amount, Vec::new())
                .map_err(|_| VaultError::TransferError)?;

            self.balances.insert(
                (market, user, id),
                &(
                    collateral_balance.saturating_add(collateral_amount),
                    collateral_asset,
                ),
            );

            return Ok(());
        }

        #[ink(message)]
        fn withdraw(
            &mut self,
            user: AccountId,
            id: u128,
            withdraw_amount: Balance,
            receiver: AccountId,
        ) -> Result<(), VaultError> {
            let market = self.env().caller();

            if !self.markets.contains(&market) {
                return Err(VaultError::MarketNotFound);
            }

            let (collateral_balance, collateral_asset) = self
                .balances
                .get((market, user, id))
                .ok_or(VaultError::CollateralNotFound)?;

            if !self.assets.contains(&collateral_asset) {
                return Err(VaultError::AssetNotFound);
            }

            if withdraw_amount <= 0 {
                return Err(VaultError::AmountIsZero);
            }

            if withdraw_amount > collateral_balance {
                return Err(VaultError::InsufficientBalance);
            }

            let mut token: contract_ref!(PSP22) = collateral_asset.into();
            token
                .transfer(receiver, withdraw_amount, Vec::new())
                .map_err(|_| VaultError::TransferError)?;

            if withdraw_amount == collateral_balance {
                self.balances.remove((market, user, id));
            } else {
                self.balances.insert(
                    (market, user, id),
                    &(
                        collateral_balance.saturating_sub(withdraw_amount),
                        collateral_asset,
                    ),
                );
            }

            return Ok(());
        }

        #[ink(message)]
        fn add_asset(&mut self, collateral_asset: AccountId) -> Result<(), VaultError> {
            let caller = self.env().caller();

            if caller != self.admin {
                return Err(VaultError::NotAdmin);
            }

            if self.assets.contains(&collateral_asset) {
                return Err(VaultError::AssetAlreadyExist);
            }

            self.assets.push(collateral_asset);

            Ok(())
        }

        #[ink(message)]
        fn add_market(&mut self, market: AccountId) -> Result<(), VaultError> {
            let caller = self.env().caller();

            if caller != self.admin {
                return Err(VaultError::NotAdmin);
            }

            if self.markets.contains(&market) {
                return Err(VaultError::MarketAlreadyExist);
            }

            self.markets.push(market);

            Ok(())
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use ink::primitives::AccountId;
        use ink_e2e::build_message;
        use psp22::TokenRef;

        type E2EResult<T> = Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn add_asset_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            let alice = &ink_e2e::alice();
            let bob = &ink_e2e::bob();
            let some_address = AccountId::from([0x01; 32]);

            let vault_constructor = VaultRef::new();
            let vault_acc_id: AccountId = client
                .instantiate("vault", alice, vault_constructor, 0, None)
                .await
                .expect("Instantiate failed")
                .account_id;

            let add_asset_not_admin = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_asset(some_address.clone()));
            let add_asset_not_admin_res = client.call(bob, add_asset_not_admin, 0, None).await;
            assert!(
                add_asset_not_admin_res.is_err(),
                "add asset not called by deployer"
            );

            let add_asset = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_asset(some_address.clone()));
            let add_asset_res = client.call(alice, add_asset, 0, None).await;
            assert!(add_asset_res.is_ok(), "add asset should succeed");

            let add_asset_same_asset = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_asset(some_address.clone()));
            let add_asset_same_asset_res = client.call(alice, add_asset_same_asset, 0, None).await;
            assert!(
                add_asset_same_asset_res.is_err(),
                "trying to add same asset"
            );

            let assets_with_access = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.supported_collateral_assets());
            let assets_with_access_res = client
                .call_dry_run(alice, &assets_with_access, 0, None)
                .await;
            assert!(
                matches!(assets_with_access_res.return_value().len(), 1),
                "one asset exists"
            );

            Ok(())
        }

        #[ink_e2e::test]
        async fn add_market_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            let alice = &ink_e2e::alice();
            let bob = &ink_e2e::bob();
            let some_address = AccountId::from([0x01; 32]);

            let vault_constructor = VaultRef::new();
            let vault_acc_id: AccountId = client
                .instantiate("vault", alice, vault_constructor, 0, None)
                .await
                .expect("Instantiate failed")
                .account_id;

            let add_market_not_admin = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_market(some_address.clone()));
            let add_market_not_admin_res = client.call(bob, add_market_not_admin, 0, None).await;
            assert!(
                add_market_not_admin_res.is_err(),
                "add market not called by deployer"
            );

            let add_market = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_market(some_address.clone()));
            let add_market_res = client.call(alice, add_market, 0, None).await;
            assert!(add_market_res.is_ok(), "add market should succeed");

            let add_market_same_asset = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_market(some_address.clone()));
            let add_market_same_asset_res =
                client.call(alice, add_market_same_asset, 0, None).await;
            assert!(
                add_market_same_asset_res.is_err(),
                "trying to add same market"
            );

            let markets_with_access = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.markets_with_access());
            let markets_with_access_res = client
                .call_dry_run(alice, &markets_with_access, 0, None)
                .await;
            assert!(
                matches!(markets_with_access_res.return_value().len(), 1),
                "one market exists"
            );

            Ok(())
        }

        #[ink_e2e::test]
        async fn deposit_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            let balance = 500_000_000u128;
            let deposit_amount = 100_000_000u128;
            let alice = &ink_e2e::alice();
            let alice_account = ink_e2e::account_id(ink_e2e::AccountKeyring::Alice);

            let vault_constructor = VaultRef::new();
            let vault_acc_id: AccountId = client
                .instantiate("vault", alice, vault_constructor, 0, None)
                .await
                .expect("Instantiate failed")
                .account_id;

            let token_constructor = TokenRef::new(balance, None, None, 0);
            let token_acc_id: AccountId = client
                .instantiate("psp22", alice, token_constructor, 0, None)
                .await
                .expect("Instantiate failed")
                .account_id;

            let token_approve = build_message::<TokenRef>(token_acc_id.clone())
                .call(|token| token.approve(vault_acc_id.clone(), balance));
            let _token_approve_res = client
                .call(alice, token_approve, 0, None)
                .await
                .expect("token approve failed");

            let deposit_no_market = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.deposit(alice_account, 0, token_acc_id.clone(), 100));
            let deposit_no_market_res = client.call(alice, deposit_no_market, 0, None).await;
            assert!(
                deposit_no_market_res.is_err(),
                "deposit caller not added to vault markets"
            );

            let add_market = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_market(alice_account));
            let _add_market_res = client
                .call(alice, add_market, 0, None)
                .await
                .expect("add_market failed");

            let deposit_no_asset = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.deposit(alice_account, 0, token_acc_id.clone(), 100));
            let deposit_no_asset_res = client.call(alice, deposit_no_asset, 0, None).await;
            assert!(
                deposit_no_asset_res.is_err(),
                "deposit asset not added to vault"
            );

            let add_asset = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_asset(token_acc_id.clone()));
            let _add_asset_res = client
                .call(alice, add_asset, 0, None)
                .await
                .expect("add_asset failed");

            let deposit_zero_amount = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.deposit(alice_account, 0, token_acc_id.clone(), 0));
            let deposit_zero_amount_res = client.call(alice, deposit_zero_amount, 0, None).await;
            assert!(deposit_zero_amount_res.is_err(), "deposit zero amount");

            let deposit = build_message::<VaultRef>(vault_acc_id.clone()).call(|vault| {
                vault.deposit(alice_account, 0, token_acc_id.clone(), deposit_amount)
            });
            let deposit_res = client.call(alice, deposit, 0, None).await;
            assert!(deposit_res.is_ok(), "deposit should succeed");

            let deposit_second = build_message::<VaultRef>(vault_acc_id.clone()).call(|vault| {
                vault.deposit(alice_account, 0, token_acc_id.clone(), deposit_amount)
            });
            let deposit_second_res = client.call(alice, deposit_second, 0, None).await;
            assert!(
                deposit_second_res.is_ok(),
                "deposit should succeed second time"
            );

            let user_collateral = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.user_collateral(alice_account, alice_account, 0));
            let user_collateral_res = client.call_dry_run(alice, &user_collateral, 0, None).await;
            let (user_collateral_res_balance, _) = user_collateral_res.return_value().unwrap();
            assert!(
                user_collateral_res_balance == deposit_amount * 2,
                "user collateral should equal: deposit_amount * 2"
            );

            let token_balance_of = build_message::<TokenRef>(token_acc_id.clone())
                .call(|token| token.balance_of(alice_account));
            let token_balance_of_res = client.call_dry_run(alice, &token_balance_of, 0, None).await;
            assert!(
                token_balance_of_res.return_value() == balance - deposit_amount * 2,
                "token balance should equal: balance - deposit_amount * 2"
            );

            Ok(())
        }

        #[ink_e2e::test]
        async fn withdraw_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            let balance = 500_000_000u128;
            let deposit_amount = 100_000_000u128;
            let withdraw_too_large_amount = 150_000_000u128;
            let withdraw_amount = 40_000_000u128;
            let withdraw_rest_amount = 60_000_000u128;
            let alice = &ink_e2e::alice();
            let alice_account = ink_e2e::account_id(ink_e2e::AccountKeyring::Alice);

            let vault_constructor = VaultRef::new();
            let vault_acc_id: AccountId = client
                .instantiate("vault", alice, vault_constructor, 0, None)
                .await
                .expect("Instantiate failed")
                .account_id;

            let token_constructor = TokenRef::new(balance, None, None, 0);
            let token_acc_id: AccountId = client
                .instantiate("psp22", alice, token_constructor, 0, None)
                .await
                .expect("Instantiate failed")
                .account_id;

            let token_approve = build_message::<TokenRef>(token_acc_id.clone())
                .call(|token| token.approve(vault_acc_id.clone(), balance));
            let _token_approve_res = client
                .call(alice, token_approve, 0, None)
                .await
                .expect("token approve failed");

            let withdraw_no_market = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.withdraw(alice_account, 0, 100, alice_account));
            let withdraw_no_market_res = client.call(alice, withdraw_no_market, 0, None).await;
            assert!(
                withdraw_no_market_res.is_err(),
                "withdraw caller not added to vault markets"
            );

            let add_market = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_market(alice_account));
            let _add_market_res = client
                .call(alice, add_market, 0, None)
                .await
                .expect("add_market failed");

            let withdraw_no_asset = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.withdraw(alice_account, 0, 100, alice_account));
            let withdraw_no_asset_res = client.call(alice, withdraw_no_asset, 0, None).await;
            assert!(
                withdraw_no_asset_res.is_err(),
                "withdraw asset not added to vault"
            );

            let add_asset = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.add_asset(token_acc_id.clone()));
            let _add_asset_res = client
                .call(alice, add_asset, 0, None)
                .await
                .expect("add_asset failed");

            let withdraw_zero_amount = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.withdraw(alice_account, 0, 0, alice_account));
            let withdraw_zero_amount_res = client.call(alice, withdraw_zero_amount, 0, None).await;
            assert!(withdraw_zero_amount_res.is_err(), "withdraw zero amount");

            let deposit = build_message::<VaultRef>(vault_acc_id.clone()).call(|vault| {
                vault.deposit(alice_account, 0, token_acc_id.clone(), deposit_amount)
            });
            let _deposit_res = client
                .call(alice, deposit, 0, None)
                .await
                .expect("deposit failed");

            let withdraw_too_much = build_message::<VaultRef>(vault_acc_id.clone()).call(|vault| {
                vault.withdraw(alice_account, 0, withdraw_too_large_amount, alice_account)
            });
            let withdraw_too_much_res = client.call(alice, withdraw_too_much, 0, None).await;
            assert!(
                withdraw_too_much_res.is_err(),
                "withdraw amount is greater than balance"
            );

            let withdraw = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.withdraw(alice_account, 0, withdraw_amount, alice_account));
            let withdraw_res = client.call(alice, withdraw, 0, None).await;
            assert!(withdraw_res.is_ok(), "withdraw should succeed");

            let user_collateral = build_message::<VaultRef>(vault_acc_id.clone())
                .call(|vault| vault.user_collateral(alice_account, alice_account, 0));
            let user_collateral_res = client.call_dry_run(alice, &user_collateral, 0, None).await;
            let (user_collateral_res_balance, _) = user_collateral_res.return_value().unwrap();
            assert!(
                user_collateral_res_balance == deposit_amount - withdraw_amount,
                "user collateral should equal: deposit_amount - withdraw_amount"
            );

            let token_balance_of = build_message::<TokenRef>(token_acc_id.clone())
                .call(|token| token.balance_of(alice_account));
            let token_balance_of_res = client.call_dry_run(alice, &token_balance_of, 0, None).await;
            assert!(
                token_balance_of_res.return_value() == balance - deposit_amount + withdraw_amount,
                "token balance should equal: balance - deposit_amount + withdraw_amount"
            );

            let withdraw_rest = build_message::<VaultRef>(vault_acc_id.clone()).call(|vault| {
                vault.withdraw(alice_account, 0, withdraw_rest_amount, alice_account)
            });
            let withdraw_rest_res = client.call(alice, withdraw_rest, 0, None).await;
            assert!(withdraw_rest_res.is_ok(), "withdraw rest should succeed");

            let user_collateral_rest_res =
                client.call_dry_run(alice, &user_collateral, 0, None).await;
            let (user_collateral_rest_res_balance, _) = user_collateral_rest_res
                .return_value()
                .unwrap_or_else(|| (0, AccountId::from([0; 32])));
            assert!(user_collateral_rest_res_balance == deposit_amount - withdraw_amount - withdraw_rest_amount, "user collateral should equal: deposit_amount - withdraw_amount - withdraw_rest_amount");

            let token_balance_of_rest_res =
                client.call_dry_run(alice, &token_balance_of, 0, None).await;
            assert!(token_balance_of_rest_res.return_value() == balance - deposit_amount + withdraw_amount + withdraw_rest_amount, "token balance should equal: balance - deposit_amount + withdraw_amount + withdraw_rest_amount");

            Ok(())
        }
    }
}
