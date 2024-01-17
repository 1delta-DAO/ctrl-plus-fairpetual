use scale::{Decode, Encode};
use ink::primitives::AccountId;

#[derive(Decode, Encode)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
)]
#[derive(Debug)]
pub struct Position {
    user: AccountId,
    id: u128,
    collateral_asset: AccountId,
    collateral_usd: u128,
    collateral_usd_decimals: u8,
    entry_price: u128,
    entry_price_decimals: u8,
    leverage: u8,
    is_long: bool,
    block_open: u32,
}

impl Position {
    pub fn new(
        user: AccountId, 
        id: u128,
        collateral_asset: AccountId,
        collateral_usd: u128,
        collateral_usd_decimals: u8,
        entry_price: u128,
        entry_price_decimals: u8, 
        leverage: u8, 
        is_long: bool, 
        block_open: u32
    ) -> Position {
        Position {
            user, 
            id, 
            collateral_asset,
            collateral_usd,
            collateral_usd_decimals,
            entry_price,
            entry_price_decimals,
            leverage, 
            is_long, 
            block_open,
        }
    }
}
