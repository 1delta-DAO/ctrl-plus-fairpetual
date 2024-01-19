#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum VaultError {
    AmountIsZero,
    AssetAlreadyExist,
    AssetNotFound,
    CollateralNotFound,
    DifferentCollateralAsset,
    InsufficientBalance,
    MarketAlreadyExist,
    MarketNotFound,
    NotAdmin,
    TransferError,
}