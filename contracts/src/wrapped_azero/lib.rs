#![cfg_attr(not(feature = "std"), no_std, no_main)]

mod traits;

pub use traits::WrappedAZERO;
pub use wazero::WAZERO_DEPOSIT_SELECTOR;

#[ink::contract]
mod wazero {
    use crate::WrappedAZERO;
    use ink::prelude::{string::String, vec::Vec};
    use psp22::{PSP22Data, PSP22Error, PSP22Event, PSP22Metadata, PSP22};

    pub const WAZERO_DEPOSIT_SELECTOR: [u8; 4] = [0, 0, 0, 7];

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
    #[derive(Default)]
    pub struct Wazero {
        data: PSP22Data,
    }

    impl Wazero {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self::default()
        }

        fn emit_events(&self, events: Vec<PSP22Event>) {
            for event in events {
                match event {
                    PSP22Event::Transfer { from, to, value } => {
                        self.env().emit_event(Transfer { from, to, value })
                    }
                    PSP22Event::Approval {
                        owner,
                        spender,
                        amount,
                    } => self.env().emit_event(Approval {
                        owner,
                        spender,
                        amount,
                    }),
                }
            }
        }
    }

    impl WrappedAZERO for Wazero {
        #[ink(message, payable, selector = 7)]
        fn deposit(&mut self) -> Result<(), PSP22Error> {
            let events = self
                .data
                .mint(self.env().caller(), self.env().transferred_value())?;
            self.emit_events(events);
            Ok(())
        }

        #[ink(message)]
        fn withdraw(&mut self, value: u128) -> Result<(), PSP22Error> {
            let caller = self.env().caller();
            let events = self.data.burn(caller, value)?;
            self.env()
                .transfer(caller, value)
                .map_err(|_| PSP22Error::Custom(String::from("Wrapped AZERO: withdraw failed")))?;
            self.emit_events(events);
            Ok(())
        }
    }

    impl PSP22Metadata for Wazero {
        #[ink(message)]
        fn token_name(&self) -> Option<String> {
            Some(String::from("Wrapped AZERO"))
        }

        #[ink(message)]
        fn token_symbol(&self) -> Option<String> {
            Some(String::from("wAZERO"))
        }

        #[ink(message)]
        fn token_decimals(&self) -> u8 {
            12
        }
    }

    impl PSP22 for Wazero {
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
            let events = self.data.transfer(self.env().caller(), to, value)?;
            self.emit_events(events);
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
            let events = self
                .data
                .transfer_from(self.env().caller(), from, to, value)?;
            self.emit_events(events);
            Ok(())
        }

        #[ink(message)]
        fn approve(&mut self, spender: AccountId, value: u128) -> Result<(), PSP22Error> {
            let events = self.data.approve(self.env().caller(), spender, value)?;
            self.emit_events(events);
            Ok(())
        }

        #[ink(message)]
        fn increase_allowance(
            &mut self,
            spender: AccountId,
            delta_value: u128,
        ) -> Result<(), PSP22Error> {
            let events = self
                .data
                .increase_allowance(self.env().caller(), spender, delta_value)?;
            self.emit_events(events);
            Ok(())
        }

        #[ink(message)]
        fn decrease_allowance(
            &mut self,
            spender: AccountId,
            delta_value: u128,
        ) -> Result<(), PSP22Error> {
            let events = self
                .data
                .decrease_allowance(self.env().caller(), spender, delta_value)?;
            self.emit_events(events);
            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{test::*, DefaultEnvironment as E};

        psp22::tests!(Wazero, crate::wazero::tests::init_psp22_supply);

        #[ink::test]
        fn constructor_works() {
            let contract = Wazero::new();
            assert_eq!(contract.total_supply(), 0);
        }

        #[ink::test]
        fn metadata_is_correct() {
            let contract = Wazero::new();
            assert_eq!(contract.token_name(), Some(String::from("Wrapped AZERO")));
            assert_eq!(contract.token_symbol(), Some(String::from("wAZERO")));
            assert_eq!(contract.token_decimals(), 12);
        }

        #[ink::test]
        fn deposit_works() {
            let mut contract = Wazero::new();
            let amount = 100;
            let alice = default_accounts::<E>().alice;
            set_caller::<E>(alice);
            set_value_transferred::<E>(amount);

            assert_eq!(contract.total_supply(), 0);
            assert_eq!(contract.balance_of(alice), 0);

            assert!(contract.deposit().is_ok());

            assert_eq!(contract.total_supply(), amount);
            assert_eq!(contract.balance_of(alice), amount);
        }

        #[ink::test]
        fn deposit_emits_event() {
            let mut contract = Wazero::new();
            let amount = 100;
            let alice = default_accounts::<E>().alice;
            set_caller::<E>(alice);
            set_value_transferred::<E>(amount);

            assert!(contract.deposit().is_ok());

            let events = decode_events();
            assert_eq!(events.len(), 1);
            assert_transfer(&events[0], None, Some(alice), amount);
        }

        #[ink::test]
        fn deposit_of_0_emits_no_event() {
            let mut contract = Wazero::new();
            let alice = default_accounts::<E>().alice;
            set_caller::<E>(alice);

            assert!(contract.deposit().is_ok());

            let events = decode_events();
            assert_eq!(events.len(), 0);
        }

        #[ink::test]
        fn multiple_deposit_works_and_emits_events() {
            let mut contract = Wazero::new();
            let amount = 100;
            let acc = default_accounts::<E>();
            let (alice, bob) = (acc.alice, acc.bob);

            assert_eq!(contract.total_supply(), 0);
            assert_eq!(contract.balance_of(alice), 0);
            assert_eq!(contract.balance_of(bob), 0);

            set_caller::<E>(alice);
            set_value_transferred::<E>(amount);
            assert!(contract.deposit().is_ok());

            assert_eq!(contract.total_supply(), amount);
            assert_eq!(contract.balance_of(alice), amount);
            assert_eq!(contract.balance_of(bob), 0);

            set_caller::<E>(bob);
            set_value_transferred::<E>(2 * amount);
            assert!(contract.deposit().is_ok());

            assert_eq!(contract.total_supply(), 3 * amount);
            assert_eq!(contract.balance_of(alice), amount);
            assert_eq!(contract.balance_of(bob), 2 * amount);

            let events = decode_events();
            assert_eq!(events.len(), 2);
            assert_transfer(&events[0], None, Some(alice), amount);
            assert_transfer(&events[1], None, Some(bob), 2 * amount);
        }

        #[ink::test]
        fn withdraw_works() {
            let (supply, amount) = (1000, 100);
            let alice = default_accounts::<E>().alice;
            set_caller::<E>(alice);
            let mut contract = init_psp22_supply(supply);

            assert_eq!(contract.total_supply(), supply);
            assert_eq!(contract.balance_of(alice), supply);

            let old_native = get_account_balance::<E>(alice).unwrap();
            assert!(contract.withdraw(amount).is_ok());
            let new_native = get_account_balance::<E>(alice).unwrap();

            assert_eq!(contract.total_supply(), supply - amount);
            assert_eq!(contract.balance_of(alice), supply - amount);
            assert_eq!(new_native - old_native, amount);
        }

        #[ink::test]
        fn withdraw_emits_event() {
            let (supply, amount) = (1000, 100);
            let alice = default_accounts::<E>().alice;
            set_caller::<E>(alice);
            let mut contract = init_psp22_supply(supply);

            assert!(contract.withdraw(amount).is_ok());

            let events = decode_events();
            assert_eq!(events.len(), 2);
            assert_transfer(&events[0], None, Some(alice), supply);
            assert_transfer(&events[1], Some(alice), None, amount);
        }

        #[ink::test]
        fn withdraw_of_0_emits_no_event() {
            let amount = 100;
            let alice = default_accounts::<E>().alice;
            set_caller::<E>(alice);
            let mut contract = init_psp22_supply(amount);

            assert!(contract.withdraw(0).is_ok());
            let events = decode_events();
            assert_eq!(events.len(), 1);
            assert_transfer(&events[0], None, Some(alice), amount);
        }

        #[ink::test]
        fn withdraw_too_much_fails() {
            let amount = 100;
            let alice = default_accounts::<E>().alice;
            set_caller::<E>(alice);
            let mut contract = init_psp22_supply(amount);
            assert_eq!(
                contract.withdraw(amount + 1),
                Err(PSP22Error::InsufficientBalance)
            );
        }

        #[ink::test]
        fn multiple_withdraw_works_and_emits_events() {
            let (initial, a, b) = (1000, 100, 10);
            let alice = default_accounts::<E>().alice;
            let bob = default_accounts::<E>().bob;
            set_caller::<E>(alice);
            set_callee::<E>(default_accounts::<E>().charlie);
            let mut contract = init_psp22_supply(2 * initial);

            assert!(contract.transfer(bob, initial, vec![]).is_ok());

            let old_alice = get_account_balance::<E>(alice).unwrap();
            let old_bob = get_account_balance::<E>(bob).unwrap();

            assert!(contract.withdraw(a).is_ok());
            set_caller::<E>(bob);
            assert!(contract.withdraw(b).is_ok());

            let new_alice = get_account_balance::<E>(alice).unwrap();
            let new_bob = get_account_balance::<E>(bob).unwrap();

            assert_eq!(contract.total_supply(), 2 * initial - a - b);
            assert_eq!(contract.balance_of(alice), initial - a);
            assert_eq!(contract.balance_of(bob), initial - b);
            assert_eq!(new_alice - old_alice, a);
            assert_eq!(new_bob - old_bob, b);

            let events = decode_events();
            assert_eq!(events.len(), 4);
            assert_transfer(&events[0], None, Some(alice), 2 * initial);
            assert_transfer(&events[1], Some(alice), Some(bob), initial);
            assert_transfer(&events[2], Some(alice), None, a);
            assert_transfer(&events[3], Some(bob), None, b);
        }

        // Unit tests helpers

        type Event = <Wazero as ink::reflect::ContractEventBase>::Type;

        // Creates a new contract with given total supply
        fn init_psp22_supply(amount: u128) -> Wazero {
            let mut contract = Wazero::new();
            set_value_transferred::<E>(amount);
            contract.deposit().unwrap();
            contract
        }

        // Gathers all emitted events into a vector
        fn decode_events() -> Vec<Event> {
            recorded_events()
                .map(|e| <Event as scale::Decode>::decode(&mut &e.data[..]).unwrap())
                .collect()
        }

        // Asserts if the given event is a Transfer with particular from_, to_ and value_
        fn assert_transfer(
            event: &Event,
            from_: Option<AccountId>,
            to_: Option<AccountId>,
            value_: u128,
        ) {
            if let Event::Transfer(Transfer { from, to, value }) = event {
                assert_eq!(*from, from_, "Transfer event: 'from' mismatch");
                assert_eq!(*to, to_, "Transfer event: 'to' mismatch");
                assert_eq!(*value, value_, "Transfer event: 'value' mismatch");
            } else {
                panic!("Event is not Transfer")
            }
        }
    }
}
