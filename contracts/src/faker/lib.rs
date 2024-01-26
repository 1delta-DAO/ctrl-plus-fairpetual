#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::faker::FakerRef;

#[ink::contract]
mod faker {
    use dia_oracle_getter::OracleGetters;
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct Faker {
        oracle: Mapping<String, (u64, u128)>,
    }

    impl Faker {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                oracle: Default::default()
            }
        }

        #[ink(message)]
        pub fn set_price(&mut self, pair: String, price: u128) -> () {
            self.oracle.insert(pair, &(0, price));
        }
    }

    impl OracleGetters for Faker {
        #[ink(message)]
        fn get_updater(&self) -> AccountId {
            AccountId::from([0; 32])
        }
    
        // price has 18 decimals
        #[ink(message)]
        fn get_latest_price(&self, pair: String) -> Option<(u64, u128)> {
            self.oracle.get(pair)
        }
    
        #[ink(message)]
        fn get_latest_prices(&self, pairs: Vec<String>) -> Vec<Option<(u64, u128)>> {
            let mut prices = Vec::new();

            for pair in pairs {
                prices.push(self.oracle.get(pair));
            }

            prices
        }
    }
}
