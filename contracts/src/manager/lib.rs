#![cfg_attr(not(feature = "std"), no_std, no_main)]

mod errors;

pub use errors::ManagerError;

#[ink::contract]
mod manager {
    use ink::{
        contract_ref, prelude::{string::String, vec::Vec}, ToAccountId
    };
    use market::MarketRef;
    use psp22::PSP22Metadata;

    use crate::ManagerError;

    #[ink(storage)]
    pub struct Manager {
        version: u8,
        owner: AccountId,
        oracle: AccountId,
        wazero: AccountId,
        vault: AccountId,
        markets: Vec<AccountId>,
        incremented_id: u128,
    }

    impl Manager {
        #[ink(constructor)]
        pub fn new(version: u8, oracle: AccountId, wazero: AccountId, vault: AccountId, markets: Vec<AccountId>) -> Self {
            Self {
                version,
                owner: Self::env().caller(),
                oracle,
                wazero,
                vault,
                markets: markets,
                incremented_id: 0,
            }
        }

        #[ink(message)]
        pub fn view_markets(&self) -> Vec<AccountId> {
            self.markets.clone()
        } 

        #[ink(message)]
        pub fn increment_id(&mut self) -> u128 {
            let id = self.incremented_id.clone();
            self.incremented_id = self.incremented_id.saturating_add(1);
            id
        }

        #[ink(message)]
        pub fn deploy_market(
            &mut self,
            market_hash: Hash,
            name: Option<String>,
            symbol: Option<String>,
            underlying_asset: AccountId,
            liquidation_threshold: i8,
            liquidation_penalty: u8,
            protocol_fee: u8,
        ) -> Result<AccountId, ManagerError> {
            if self.env().caller() != self.owner {
                return Err(ManagerError::NotOwner);
            }

            let asset: contract_ref!(PSP22Metadata) = underlying_asset.into();
            let market_ref = MarketRef::new(
                name,
                symbol,
                asset.token_decimals(),
                underlying_asset,
                self.oracle,
                self.vault,
                self.wazero,
                liquidation_threshold,
                liquidation_penalty,
                protocol_fee,
            )
            .endowment(0)
            .code_hash(market_hash)
            .salt_bytes(
                &[
                    self.version.to_le_bytes().as_ref(),
                    Self::env().caller().as_ref(),
                ]
                .concat()[..4],
            )
            .instantiate();

            let market = <MarketRef as ToAccountId<super::manager::Environment>>::to_account_id(
                &market_ref,
            );

            self.markets.push(market);

            Ok(market)
        }

        #[ink(message)]
        pub fn add_market(
            &mut self,
            market: AccountId,
        ) -> Result<AccountId, ManagerError> {
            if self.env().caller() != self.owner {
                return Err(ManagerError::NotOwner);
            }

            self.markets.push(market);

            Ok(market)
        }
    }
}
