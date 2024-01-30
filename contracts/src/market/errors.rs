use ink::prelude::string::String;
use psp22::PSP22Error;
use vault::VaultError;

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
    Overflow(String),
    PositionNotFound,
    TransferFailed,
    OracleFailed,
    VaultError(VaultError),
    PSP22Error(PSP22Error)
}
