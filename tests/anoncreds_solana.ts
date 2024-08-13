import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnoncredsSolana } from "../target/types/anoncreds_solana";
import { anoncreds, Credential, CredentialDefinition, CredentialOffer, CredentialRequest, JsonObject, LinkSecret, Presentation, PresentationRequest, Schema } from "@hyperledger/anoncreds-nodejs";
import { expect } from "chai";
import { splitStringFromEnd } from "./utils";

describe("anoncreds_solana", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AnoncredsSolana as Program<AnoncredsSolana>;

  it("Simple Complete test", async () => {
    const nonce = anoncreds.generateNonce()

    const signer = anchor.Wallet.local().payer;

    const addressIssuer = signer.publicKey.toBase58();



    const base = `solana:${program.programId}`
    const issuerId = `${base}:${addressIssuer}`

    const presentationRequest = PresentationRequest.fromJson({
      nonce,
      name: 'pres_req_1',
      version: '0.1',
      requested_attributes: {
        attr1_referent: {
          name: 'name',
          issuer: issuerId
        },
        attr2_referent: {
          name: 'sex'
        },
        attr3_referent: {
          name: 'phone'
        },
        attr4_referent: {
          names: ['name', 'height']
        }
      },
      requested_predicates: {
        predicate1_referent: { name: 'age', p_type: '>=', p_value: 18 }
      },
      non_revoked: { from: 13, to: 200 }
    })

    const schema = Schema.create({
      name: 'schema-1',
      issuerId,
      version: '1',
      attributeNames: ['name', 'age', 'sex', 'height']
    }) 

    interface SchemaRepresentation{
      name: string;
      issuerId: string;
      version: string;
      attrNames: string[];
    }
 
    const schemaRep = schema.toJson() as unknown as SchemaRepresentation;

    const [schema_account, bump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("schema"), Buffer.from(schemaRep.name), Buffer.from(schemaRep.version), signer.publicKey.toBuffer()],
      program.programId
    );
    
    const result = await program.methods.storeSchema(schemaRep,new anchor.BN(500))
              .accounts({
                signer:signer.publicKey,
              }).rpc();

    console.log("storeSchema: ",result);
    

    const schemaId = `${issuerId}/schema/${schema_account.toString()}`

    const newSchema = await program.account.schema.fetch(schema_account);

    console.log("fetched Schema:",newSchema);

    const parsedNewSchema = Schema.fromJson(newSchema as JsonObject);

    expect(JSON.stringify(parsedNewSchema.toJson())).to.equal(JSON.stringify(schema.toJson()));
    
    

    const { credentialDefinition, keyCorrectnessProof, credentialDefinitionPrivate } = CredentialDefinition.create({
      schemaId,
      issuerId,
      schema: parsedNewSchema,
      signatureType: 'CL',
      tag: 'TAG'
    })


    const credDefJson = credentialDefinition.toJson();
    const value = credDefJson.value;
    const valueJson = JSON.stringify(value);

    const chunks = splitStringFromEnd(valueJson, 800);

    const crypto = require('crypto');
    let concatenation = Buffer.concat([Buffer.from("credential_definition"), Buffer.from(credDefJson.tag as string), Buffer.from(credDefJson.schemaId as string), signer.publicKey.toBuffer()]);
    let hexString = crypto.createHash('sha256').update(concatenation,'utf-8').digest('hex');
    let seed = Uint8Array.from(Buffer.from(hexString,'hex'));

    let [credentialDefAccount, _] = await anchor.web3.PublicKey.findProgramAddressSync([seed],program.programId);

    console.log(credentialDefAccount.toString());

    const result2 = await program.methods.storeCredentialDefinition({...credDefJson, value: chunks[0]} as any, new anchor.BN(10000))
    .accountsPartial({
      signer:signer.publicKey,
      credDefAcccount: credentialDefAccount
    }).rpc();

    console.log("storeCredentialDefinition: ",result2);
    
    for(const chunk of chunks.slice(1)){
      const resultAmortiz = await program.methods.amortizationCredentialDefinition(credDefJson.tag as string, credDefJson.schemaId as string,chunk)
      .accountsPartial({
        signer:signer.publicKey,
        credDefAcccount: credentialDefAccount
      }).rpc();
  
      console.log("storeCredentialDefinition: ",resultAmortiz);

      await program.provider.connection.confirmTransaction(resultAmortiz, 'confirmed');
    }


    const credentialDefinitionId = `${issuerId}/credential_definition/${credentialDefAccount}`

    const newCredentialDefinitionJson = await program.account.credentialDefinition.fetch(credentialDefAccount);
    const newCredentialDefinition = {...newCredentialDefinitionJson, value: JSON.parse(newCredentialDefinitionJson.value)}
    console.log("fetched credentialDefinition:",newCredentialDefinition);

    const parsedNewCredentialDefinition = CredentialDefinition.fromJson(newCredentialDefinition as JsonObject);


    const credentialOffer = CredentialOffer.create({
      schemaId,
      credentialDefinitionId,
      keyCorrectnessProof
    })

    const linkSecret = LinkSecret.create()
    const linkSecretId = 'link secret id'

    const { credentialRequestMetadata, credentialRequest } = CredentialRequest.create({
      entropy: 'entropy',
      credentialDefinition: parsedNewCredentialDefinition,
      linkSecret,
      linkSecretId,
      credentialOffer
    })

    const credential = Credential.create({
      credentialDefinition: parsedNewCredentialDefinition,
      credentialDefinitionPrivate,
      credentialOffer,
      credentialRequest,
      attributeRawValues: { name: 'Alex', height: '175', age: '28', sex: 'male' },
    })

    const credentialReceived = credential.process({
      credentialDefinition: parsedNewCredentialDefinition,
      credentialRequestMetadata,
      linkSecret,
    })

    const presentation = Presentation.create({
      presentationRequest,
      credentials: [
        {
          credential: credentialReceived,
        }
      ],
      credentialDefinitions: { [credentialDefinitionId]: parsedNewCredentialDefinition },
      credentialsProve: [
        {
          entryIndex: 0,
          isPredicate: false,
          referent: 'attr1_referent',
          reveal: true
        },
        {
          entryIndex: 0,
          isPredicate: false,
          referent: 'attr2_referent',
          reveal: false
        },
        {
          entryIndex: 0,
          isPredicate: false,
          referent: 'attr4_referent',
          reveal: true
        },
        {
          entryIndex: 0,
          isPredicate: true,
          referent: 'predicate1_referent',
          reveal: true
        }
      ],
      linkSecret,
      schemas: {[schemaId]: parsedNewSchema },
      selfAttest: { attr3_referent: '8-800-300' }
    })

    const verify = presentation.verify({
      presentationRequest,
      schemas: { [schemaId]: parsedNewSchema },
      credentialDefinitions: { [credentialDefinitionId]: parsedNewCredentialDefinition },
    })

    expect(verify).to.be.true;
  });
});
