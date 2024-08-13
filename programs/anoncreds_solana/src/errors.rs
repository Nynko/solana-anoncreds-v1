
use anchor_lang::prelude::*;

#[error_code]
pub enum UriError {
    #[msg("Couldn't match the issuer id to a publickey: either wrong size or invalid")]
    IssuerIdNotMatching,
    #[msg("The uri seems badly formatted")]
    BadlyFormattedUri,
}

#[error_code]
pub enum StoreSchemaError {
    #[msg("The issuer account and the issuer indicated in the schema don't match")]
    IssuerAccountNotMatchingSchemaIssuerId,
}
