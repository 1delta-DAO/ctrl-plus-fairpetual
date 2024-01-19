use ink::prelude::string::String;

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum MarketError {
    Custom(String),
    ApproveFailed,
    BurnFailed,
    MintFailed,
    OracleFailed,
    Overflow,
    PSP22MetaDataFailed,
    TransferFailed,
    VaultError,
}
