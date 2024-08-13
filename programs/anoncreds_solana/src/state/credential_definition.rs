use anchor_lang::prelude::*;

#[account]
pub struct CredentialDefinition {
    pub issuer_id: String,
    pub schema_id: String,
    pub _type: String,
    pub tag: String,
    pub value: String, // Representing fully the json would add too much complexity, and not really useful for now 
}
