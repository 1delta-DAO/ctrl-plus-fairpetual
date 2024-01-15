#![cfg_attr(not(feature = "std"), no_std, no_main)]

mod errors;
mod traits;

pub use errors::WrapperError;
pub use traits::Wrapper;

#[ink::contract]
mod native_wrapper {
    use crate::{Wrapper, WrapperError};
    use psp22::{PSP22Data, PSP22Error, PSP22Metadata, PSP22};
    use ink::prelude::{string::String, vec::Vec};

    #[ink(storage)]
    pub struct NativeWrapper {
        data: PSP22Data, // (1)
        name: Option<String>,
        symbol: Option<String>,
        decimals: u8,
    }

    impl NativeWrapper {
        #[ink(constructor)]
        pub fn new(
            supply: u128,
            name: Option<String>,
            symbol: Option<String>,
            decimals: u8,
        ) -> Self {
            Self {
                data: PSP22Data::new(supply, Self::env().caller()), // (2)
                name,
                symbol,
                decimals,
            }
        }
    }

    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        spender: AccountId,
        amount: u128,
    }

    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        value: u128,
    }

    impl PSP22 for NativeWrapper {
        #[ink(message)]
        fn total_supply(&self) -> u128 {
            self.data.total_supply()
        }

        #[ink(message)]
        fn balance_of(&self, owner: AccountId) -> u128 {
            self.data.balance_of(owner)
        }

        #[ink(message)]
        fn allowance(&self, owner: AccountId, spender: AccountId) -> u128 {
            self.data.allowance(owner, spender)
        }

        #[ink(message)]
        fn transfer(
            &mut self,
            to: AccountId,
            value: u128,
            _data: Vec<u8>,
        ) -> Result<(), PSP22Error> {
            self.data.transfer(self.env().caller(), to, value)?;
            Ok(())
        }

        #[ink(message)]
        fn transfer_from(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: u128,
            _data: Vec<u8>,
        ) -> Result<(), PSP22Error> {
            self
                .data
                .transfer_from(self.env().caller(), from, to, value)?;
            Ok(())
        }

        #[ink(message)]
        fn approve(&mut self, spender: AccountId, value: u128) -> Result<(), PSP22Error> {
            self.data.approve(self.env().caller(), spender, value)?;
            Ok(())
        }

        #[ink(message)]
        fn increase_allowance(
            &mut self,
            spender: AccountId,
            delta_value: u128,
        ) -> Result<(), PSP22Error> {
            self
                .data
                .increase_allowance(self.env().caller(), spender, delta_value)?;
            Ok(())
        }

        #[ink(message)]
        fn decrease_allowance(
            &mut self,
            spender: AccountId,
            delta_value: u128,
        ) -> Result<(), PSP22Error> {
            self
                .data
                .decrease_allowance(self.env().caller(), spender, delta_value)?;
            Ok(())
        }
    }

    impl PSP22Metadata for NativeWrapper {
        #[ink(message)]
        fn token_name(&self) -> Option<String> {
            self.name.clone()
        }

        #[ink(message)]
        fn token_symbol(&self) -> Option<String> {
            self.symbol.clone()
        }

        #[ink(message)]
        fn token_decimals(&self) -> u8 {
            self.decimals
        }
    }

    impl Wrapper for NativeWrapper {
        #[ink(message, payable)]
        fn deposit(&mut self) -> Result<(), WrapperError> {
            let transfered_amount = self.env().transferred_value();

            if transfered_amount <= 0 {
                return Err(WrapperError::AmountIsZero);
            }

            let caller = self.env().caller();
            self.data.mint(caller, transfered_amount).map_err(|_| WrapperError::MintingFailed)?;

            Ok(())
        }

        #[ink(message)]
        fn withdraw(&mut self, amount: u128) -> Result<(), WrapperError> {
            let caller = self.env().caller();
            let balance = self.data.balance_of(caller);

            if balance < amount {
                return Err(WrapperError::InsufficientBalance);
            }

            self.data.burn(caller, amount).map_err(|_| WrapperError::MintingFailed)?;
            self.env().transfer(caller, amount).map_err(|_| WrapperError::TransferFailed)?;
            
            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        psp22::tests!(NativeWrapper, (|supply| NativeWrapper::new(supply, None, None, 0)));
    }
}
