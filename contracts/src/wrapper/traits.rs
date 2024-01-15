use crate::errors::WrapperError;

#[ink::trait_definition]
pub trait Wrapper {
    /// Deposits transfered native currency amount as PSP22 token.
    ///
    /// # Errors
    ///
    /// Returns with `AmountIsZero` if transfered amount is 0 or less.
    #[ink(message, payable)]
    fn deposit(&mut self) -> Result<(), WrapperError>;

    /// Withdraws native currency and transfers to caller.
    ///
    /// # Errors
    ///
    /// Returns with `InsufficientBalance` if the `amount` exceeds the caller's balance.
    #[ink(message)]
    fn withdraw(&mut self, amount: u128) -> Result<(), WrapperError>;
}