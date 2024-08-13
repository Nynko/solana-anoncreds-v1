# SOLANA as a VDR for anoncreds V1
This is work in progress and may never be used/continued.
It will be use as a simple first implementation for an off-chain name verification 
associated with public keys (this breaks unlinkability, a better way would be to use an xpub with proof of key derivation allowing to have several keys association without link between them).  
Currently there is no revocation capabilities, only storing schema and credential Definitions.

## URI format 

I defined the URI format as :
```
solana:<contract-address>:<issuer-pubkey>/object-type/<account_on_solana_storing_the_data>
```
with uncertainty over it being a proper format to use as a standard. 
This will likely be changed.

## Methods

No methods have been defined yet, but it will be added depending on how to match governance specifications: 
https://hyperledger.github.io/anoncreds-methods-registry/#governance

