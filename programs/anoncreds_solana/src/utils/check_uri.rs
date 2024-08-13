use std::str::FromStr;

use anchor_lang::prelude::*;

use crate::UriError;


// Format of uri:
// solana:<contract-address>:<issuer-pubkey>/object-type/<account_on_solana_storing_the_data>

// Get issuer from an issuer_id URI
// Issuer_id should be solana:<issuer-pubkey>
pub fn issuer_from_issuer_id(issuer_id_uri: &String) -> Result<Pubkey>{

    // Split the URI by ':' and '/' to get the components
    let parts: Vec<&str> = issuer_id_uri.split(&[':','/'][..]).collect();
        
    // The issuer pubkey is the third part (index 2)
    if parts.len() > 2 {
        let issuer_pubkey = parts[2];
        let pub_key = Pubkey::from_str(issuer_pubkey).map_err(|_e| UriError::IssuerIdNotMatching)?;
        return Ok(pub_key);
    } 
        
    return err!(UriError::BadlyFormattedUri);

        
}