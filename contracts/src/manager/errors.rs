use vault::VaultError;

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum ManagerError {
    NotOwner,
    VaultError(VaultError),
}
