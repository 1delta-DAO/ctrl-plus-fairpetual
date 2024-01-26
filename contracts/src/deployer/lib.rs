#![cfg_attr(not(feature = "std"), no_std, no_main)]

mod errors;

pub use errors::DeployerError;

#[ink::contract]
mod deployer {
    use ink::{
        contract_ref,
        prelude::{string::String, vec::Vec},
        ToAccountId,
    };
    use market::MarketRef;
    use psp22::PSP22Metadata;
    use vault::VaultRef;
    use wrapped_azero::WazeroRef;

    use crate::DeployerError;

    #[ink(storage)]
    pub struct Deployer {
        version: u8,
        owner: AccountId,
        oracle: AccountId,
        wazero: AccountId,
        vault: AccountId,
        markets: Vec<AccountId>,
        incremented_id: u128,
    }

    impl Deployer {
        #[ink(constructor)]
        pub fn new(version: u8, oracle: AccountId, wazero_hash: Hash, vault_hash: Hash) -> Self {
            let wazero_ref = WazeroRef::new()
                .endowment(0)
                .code_hash(wazero_hash)
                .salt_bytes(
                    &[
                        version.to_le_bytes().as_ref(),
                        Self::env().caller().as_ref(),
                    ]
                    .concat()[..4],
                )
                .instantiate();

            let wazero = <WazeroRef as ToAccountId<super::deployer::Environment>>::to_account_id(
                &wazero_ref,
            );

            let vault_ref = VaultRef::new()
                .endowment(0)
                .code_hash(vault_hash)
                .salt_bytes(
                    &[
                        version.to_le_bytes().as_ref(),
                        Self::env().caller().as_ref(),
                    ]
                    .concat()[..4],
                )
                .instantiate();

            let vault =
                <VaultRef as ToAccountId<super::deployer::Environment>>::to_account_id(&vault_ref);

            Self {
                version,
                owner: Self::env().caller(),
                oracle,
                wazero,
                vault,
                markets: Default::default(),
                incremented_id: 0,
            }
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
        ) -> Result<(), DeployerError> {
            if self.env().caller() != self.owner {
                return Err(DeployerError::NotOwner);
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

            let market = <MarketRef as ToAccountId<super::deployer::Environment>>::to_account_id(
                &market_ref,
            );

            self.markets.push(market);

            Ok(())
        }
    }
}
