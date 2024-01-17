use ink::primitives::AccountId;
use ink::prelude::vec::Vec;

use crate::errors::VaultError;

#[ink::trait_definition]
pub trait CollateralVault {
    #[ink(message)]
    fn user_collateral(
        &self,
        asset: AccountId,
        user: AccountId,
        id: u128,
    ) -> Option<u128>;

    #[ink(message)]
    fn supported_collateral_assets(&self) -> Vec<AccountId>;

    #[ink(message)]
    fn markets_with_access(&self) -> Vec<AccountId>;

    #[ink(message)]
    fn deposit(
        &mut self,
        asset: AccountId,
        user: AccountId,
        id: u128,
        amount: u128,
    ) -> Result<(), VaultError>;

    #[ink(message)]
    fn withdraw(
        &mut self,
        asset: AccountId,
        user: AccountId,
        id: u128,
        amount: u128,
    ) -> Result<(), VaultError>;

    #[ink(message)]
    fn add_asset(&mut self, asset: AccountId) -> Result<(), VaultError>;

    #[ink(message)]
    fn add_market(&mut self, market: AccountId) -> Result<(), VaultError>;
}