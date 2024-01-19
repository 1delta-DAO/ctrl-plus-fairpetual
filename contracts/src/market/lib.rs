#![cfg_attr(not(feature = "std"), no_std, no_main)]

mod errors;
mod position;

pub use errors::MarketError;
pub use position::Position;

#[ink::contract]
mod market {
    use crate::{MarketError, Position};
    use dia_oracle_getter::OracleGetters;
    use ink::{
        contract_ref,
        prelude::{format, string::String, vec::Vec},
        storage::Mapping,
    };
    use psp22::{PSP22Data, PSP22Error, PSP22Metadata, PSP22};
    use vault::CollateralVault;

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

    #[ink(storage)]
    pub struct Market {
        data: PSP22Data,
        name: Option<String>,
        symbol: Option<String>,
        decimals: u8,
        owner: AccountId,
        // (user, positionId) => Position
        positions: Mapping<(AccountId, u128), Position>,
        // user => latest position id
        ids: Mapping<AccountId, u128>,
        // tradable asset
        underlying_asset: AccountId,
        oracle: AccountId,
        vault: AccountId,
    }

    impl Market {
        #[ink(constructor)]
        pub fn new(
            supply: u128,
            name: Option<String>,
            symbol: Option<String>,
            decimals: u8,
            underlying_asset: AccountId,
            oracle: AccountId,
            vault: AccountId,
        ) -> Self {
            Self {
                data: PSP22Data::new(supply, Self::env().caller()),
                name,
                symbol,
                decimals,
                owner: Self::env().caller(),
                positions: Default::default(),
                ids: Default::default(),
                underlying_asset,
                oracle,
                vault,
            }
        }

        fn get_price(&self, symbol: String) -> Result<u128, MarketError> {
            let pair_symbol = format!("{symbol}/USD");

            let oracle_getter: contract_ref!(OracleGetters) = self.oracle.into();
            // DIA price oracle returns USD price with 18 decimals by default
            let oracle_decimals: u8 = 18;
            let target_decimals: u8 = 6;

            let (_timestamp, price) = oracle_getter
                .get_latest_price(pair_symbol)
                .ok_or(MarketError::OracleFailed)?;

            let abbreviated_price = price
                .checked_div((10 as u128).pow(oracle_decimals as u32 - target_decimals as u32))
                .ok_or(MarketError::Overflow);

            abbreviated_price
        }

        fn get_symbol_and_decimals(&self, token: AccountId) -> Result<(String, u8), MarketError> {
            let metadata: contract_ref!(PSP22Metadata) = token.into();

            let symbol = metadata.token_symbol().ok_or(MarketError::OracleFailed)?;

            let decimals = metadata.token_decimals();

            Ok((symbol, decimals))
        }

        fn calculate_usd_from_asset_amount(
            &self,
            asset_amount: u128,
            asset_decimals: u8,
            price: u128,
        ) -> Result<u128, MarketError> {
            asset_amount
                .checked_mul(price)
                .ok_or(MarketError::Overflow)?
                .checked_div(asset_decimals as u128)
                .ok_or(MarketError::Overflow)
        }

        #[ink(message)]
        pub fn open(
            &mut self,
            collateral_asset: AccountId,
            collateral_amount: Balance,
            is_long: bool,
            leverage: u8,
        ) -> Result<(), MarketError> {
            let caller = self.env().caller();
            let contract = self.env().account_id();

            let mut collateral: contract_ref!(PSP22) = collateral_asset.into();
            collateral
                .transfer_from(caller, contract, collateral_amount, Vec::new())
                .map_err(|_| MarketError::TransferFailed)?;

            let (collateral_symbol, collateral_decimals) = self.get_symbol_and_decimals(collateral_asset)?;
            let collateral_price = self.get_price(collateral_symbol)?;
            
            let collateral_usd =
                self.calculate_usd_from_asset_amount(collateral_amount, collateral_decimals, collateral_price)?;

            let (symbol, _decimals) = self.get_symbol_and_decimals(self.underlying_asset)?;
            let entry_price = self.get_price(symbol)?;

            let id = self.ids.get(caller).unwrap_or_default();
            self.positions.insert(
                (caller, id),
                &Position::new(
                    caller,
                    id,
                    collateral_amount,
                    collateral_asset,
                    collateral_usd,
                    entry_price,
                    leverage,
                    is_long,
                    self.env().block_number(),
                ),
            );

            collateral
                .approve(self.vault, collateral_amount)
                .map_err(|_| MarketError::ApproveFailed)?;

            let mut vault: contract_ref!(CollateralVault) = self.vault.into();
            vault
                .deposit(caller, id, collateral_asset, collateral_amount)
                .map_err(|_| MarketError::VaultError)?;

            self.ids.insert(caller, &id.saturating_add(1));

            Ok(())
        }
    }

    impl PSP22Metadata for Market {
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

    impl PSP22 for Market {
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
            let _events = self.data.transfer(self.env().caller(), to, value)?;
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
            let _events = self
                .data
                .transfer_from(self.env().caller(), from, to, value)?;
            Ok(())
        }

        #[ink(message)]
        fn approve(&mut self, spender: AccountId, value: u128) -> Result<(), PSP22Error> {
            let _events = self.data.approve(self.env().caller(), spender, value)?;
            Ok(())
        }

        #[ink(message)]
        fn increase_allowance(
            &mut self,
            spender: AccountId,
            delta_value: u128,
        ) -> Result<(), PSP22Error> {
            let _events =
                self.data
                    .increase_allowance(self.env().caller(), spender, delta_value)?;
            Ok(())
        }

        #[ink(message)]
        fn decrease_allowance(
            &mut self,
            spender: AccountId,
            delta_value: u128,
        ) -> Result<(), PSP22Error> {
            let _events =
                self.data
                    .decrease_allowance(self.env().caller(), spender, delta_value)?;
            Ok(())
        }
    }
}
