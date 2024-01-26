use ink::prelude::vec::Vec;
use ink::primitives::AccountId;

use crate::errors::VaultError;

#[ink::trait_definition]
pub trait CollateralVault {
    #[ink(message)]
    fn user_collateral(
        &self,
        market: AccountId,
        user: AccountId,
        id: u128,
    ) -> Option<(u128, AccountId)>;

    #[ink(message)]
    fn supported_collateral_assets(&self) -> Vec<AccountId>;

    #[ink(message)]
    fn markets_with_access(&self) -> Vec<AccountId>;

    #[ink(message)]
    fn deposit(
        &mut self,
        user: AccountId,
        id: u128,
        collateral_asset: AccountId,
        collateral_amount: u128,
    ) -> Result<(), VaultError>;

    #[ink(message)]
    fn withdraw(
        &mut self,
        user: AccountId,
        id: u128,
        withdraw_amount: u128,
        receiver: AccountId,
    ) -> Result<(), VaultError>;

    #[ink(message)]
    fn add_asset(&mut self, collateral_asset: AccountId) -> Result<(), VaultError>;

    #[ink(message)]
    fn add_market(&mut self, market: AccountId) -> Result<(), VaultError>;
}
