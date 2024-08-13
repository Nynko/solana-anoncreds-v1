use anchor_lang::prelude::*;

#[account]
pub struct Schema {
    pub issuer_id: String,
    pub name: String,
    pub version: String,
    pub attr_names: Vec<String>
}