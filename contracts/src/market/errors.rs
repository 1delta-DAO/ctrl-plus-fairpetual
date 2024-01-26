use ink::prelude::string::String;

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum MarketError {
    Custom(String),
    ApproveFailed,
    BurnFailed,
    LangError,
    MintFailed,
    NotLiquidatable,
    NotSupported,
    OracleFailed,
    Overflow,
    PositionNotFound,
    PSP22MetaDataFailed,
    TransferFailed,
    VaultError,
}
