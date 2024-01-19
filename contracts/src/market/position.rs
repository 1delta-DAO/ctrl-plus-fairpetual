use ink::primitives::AccountId;
use scale::{Decode, Encode};

#[derive(Decode, Encode)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
)]
#[derive(Debug)]
pub struct Position {
    pub user: AccountId,
    pub id: u128,
    pub collateral_amount: u128,
    pub collateral_asset: AccountId,
    pub collateral_usd: u128,
    pub entry_price: u128,
    pub leverage: u8,
    pub is_long: bool,
    pub block_open: u32,
}

impl Position {
    pub fn new(
        user: AccountId,
        id: u128,
        collateral_amount: u128,
        collateral_asset: AccountId,
        collateral_usd: u128,
        entry_price: u128,
        leverage: u8,
        is_long: bool,
        block_open: u32,
    ) -> Position {
        Position {
            user,
            id,
            collateral_amount,
            collateral_asset,
            collateral_usd,
            entry_price,
            leverage,
            is_long,
            block_open,
        }
    }
}
