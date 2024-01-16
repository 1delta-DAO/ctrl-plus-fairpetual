use psp22::PSP22Error;

#[ink::trait_definition]
pub trait WrappedAZERO {
    /// Deposits the transferred amount of AZERO and mints that much wAZERO to the callers account.
    ///
    /// # Events
    ///
    /// On success a `Transfer` event is emitted for newly minted wAZERO (with `from` being `None`).
    ///
    /// No-op if the transferred value is zero, returns success and no events are emitted.
    ///
    /// # Errors
    ///
    /// Reverts with `Custom` error variant if minting new tokens would cause the total token supply
    /// to exceed maximal `u128` value.
    #[ink(message, payable)]
    fn deposit(&mut self) -> Result<(), PSP22Error>;

    /// Burns `value` wAZERO tokens from the callers account and transfers that much AZERO to them.
    ///
    /// # Events
    ///
    /// On success a `Transfer` event is emitted for burned wAZERO (with `to` being `None`).
    ///
    /// No-op if the `value` is zero, returns success and no events are emitted.
    ///
    /// # Errors
    ///
    /// Reverts with `InsufficientBalance` if the `value` exceeds the caller's wAZERO balance.
    #[ink(message)]
    fn withdraw(&mut self, value: u128) -> Result<(), PSP22Error>;
}
