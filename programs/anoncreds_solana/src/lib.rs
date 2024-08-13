use anchor_lang::prelude::*;
mod state;
mod utils;
mod errors;
use state::*;
use utils::*;
use errors::*;
declare_id!("3L5JCJMYAj5UwieSvEvtaRg9vqETjJUZZaN3AKRt9dQU");

#[program]
pub mod anoncreds_solana {

    use super::*;

    pub fn store_schema(ctx: Context<InitializeSchema>, schema: Schema, _space: u64) -> Result<()> {
        // Check that the issuerId match the actual signer
        let signer = ctx.accounts.signer.key();
        let issuer_id = issuer_from_issuer_id(&schema.issuer_id)?;
        if signer != issuer_id {
            return  err!(StoreSchemaError::IssuerAccountNotMatchingSchemaIssuerId);
        }

        let schema_account = &mut ctx.accounts.schema_acccount;

        schema_account.issuer_id = schema.issuer_id;
        schema_account.name = schema.name;
        schema_account.version = schema.version;
        schema_account.attr_names = schema.attr_names;
        Ok(())
    }

    pub fn store_credential_definition(ctx: Context<InitializeCredentialDefinition>, credential_definition: CredentialDefinition, _space: u64) -> Result<()>{
        // Check that the issuerId match the actual signer
        let signer = ctx.accounts.signer.key();
        let issuer_id = issuer_from_issuer_id(&credential_definition.issuer_id)?;
        if signer != issuer_id {
            return  err!(StoreSchemaError::IssuerAccountNotMatchingSchemaIssuerId);
        }

        // Check the uri of the schema for the schema id
        // TODO
       
        let cred_def_account = &mut ctx.accounts.cred_def_acccount;

        cred_def_account.issuer_id = credential_definition.issuer_id;
        cred_def_account.schema_id = credential_definition.schema_id;
        cred_def_account._type = credential_definition._type;
        cred_def_account.tag = credential_definition.tag;
        cred_def_account.value = credential_definition.value;
        
        Ok(())
    }

    pub fn amortization_credential_definition(ctx: Context<AmortizationCredentialDefinition>, _tag: String, _schema_id: String, data_to_add: String) -> Result<()>{
        // Check that the issuerId match the actual signer
        let signer = ctx.accounts.signer.key();
        let issuer_id = issuer_from_issuer_id(&ctx.accounts.cred_def_acccount.issuer_id)?;
        if signer != issuer_id {
            return  err!(StoreSchemaError::IssuerAccountNotMatchingSchemaIssuerId);
        }
       
        let cred_def_account = &mut ctx.accounts.cred_def_acccount;

        cred_def_account.value += &data_to_add;
        
        Ok(())
    }
    
}

#[derive(Accounts)]
#[instruction(schema: Schema, _space : u64)]
pub struct InitializeSchema<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init, seeds = [b"schema", schema.name.as_bytes(), schema.version.as_bytes(), signer.key().as_ref()], bump, payer = signer, space = _space as usize)]
    pub schema_acccount: Account<'info, Schema>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(credential_definition: CredentialDefinition, _space : u64)]
pub struct InitializeCredentialDefinition<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init, seeds = [&anchor_lang::solana_program::hash::hash(&[b"credential_definition", credential_definition.tag.as_bytes(), credential_definition.schema_id.as_bytes(),signer.key().as_ref()].concat()).to_bytes()], bump, payer = signer, space = _space as usize)]
    pub cred_def_acccount: Account<'info, CredentialDefinition>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_tag: String, _schema_id: String)]
pub struct AmortizationCredentialDefinition<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut, seeds = [&anchor_lang::solana_program::hash::hash(&[b"credential_definition", _tag.as_bytes(), _schema_id.as_bytes(),signer.key().as_ref()].concat()).to_bytes()], bump)]
    pub cred_def_acccount: Account<'info, CredentialDefinition>,
    pub system_program: Program<'info, System>,
}
