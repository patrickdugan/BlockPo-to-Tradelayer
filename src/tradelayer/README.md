---
description: Here's where we break down the actual TradeLayer Codebase in detail
---

# tradelayer

[tally.h](.%23tally.h)

ac[tivation.cpp](activation.cpp)

[activation.h](activation.h)

A basic system of governance where a hardcoded multisig address can publish valid activation tx that adjust the routing of logic in the Rules.cpp file.

[ce.cpp](ce.cpp)

[ce.h](ce.h)

Defines the contract property id numbers management when a new contract is created.

[consensushash.cpp](consensushash.cpp)

[consensushash.h](consensushash.h)

This defines the functions to agglomerate all the TL data structures into a consensus hash. Creates the idea of a canonical version history that is vectorized in order to navegate consensus failures through regression to a previous stable version, and also to key into the procession of planned upgrades in the original roadmap (which are very much finite).&#x20;

[convert.cpp](convert.cpp)

[convert.h](convert.h)

Math function around uint 64.

[createpayload.cpp](createpayload.cpp)

[createpayload.h](createpayload.h)

This encodes the payload from a set of cleartext parameters that goes into the OP\_Return output. &#x20;

[createtx.cpp](createtx.cpp)

[createtx.h](createtx.h)

Tx building logic utilized in a variety of RPCs. To create more elaborate UTXO management logic, this would be a place to go (but one can also do this in .js or other language at the app level using vanilla RPCs around building raw tx and raw TL tx).

[dex.cpp](dex.cpp)

[dex.h](dex.h)

This is the old school Dex from 2014 with the 3 confirmations process to trade. We tried modifying the parameters but it is largely vestigial, use at your own risk. Delivery failures are possible during high load times.

[encoding.cpp](encoding.cpp)

[encoding.h](encoding.h)

Handles the base encoding for the strings created in createpayload.cpp

[errors.h](errors.h)

defines errors

[externfns.cpp](externfns.cpp)

[externfns.h](externfns.h)

general utility

[fetchwallettx.cpp](fetchwallettx.cpp)

[fetchwallettx.h](fetchwallettx.h)

LevelDB look-up supporting RPC calls

[log.cpp](log.cpp)

[log.h](log.h)&#x20;

Defines what the logger puts in the log files as the client runs.

[mdex.cpp](mdex.cpp)

[mdex.h](mdex.h)

xTrade function drives the core of a matching engine based on on-chain limit order books with preference going to a mempool timestamp which is itself stochastic and ultimately subject to miner consensus most likely, so this is a core part of the protocol when it comes to risk-off liquidity and processing liquidations, but it's disfavored for most volume relative to Trade Channels.

[notifications.cpp](notifications.cpp)

[notifications.h](notifications.h)

Little-used notifications system.

[operators\_algo\_clearing.cpp](operators\_algo\_clearing.cpp)

[operators\_algo\_clearing.h](operators\_algo\_clearing.h)&#x20;

Original clearing algo now deprecated to audit tools for clearing graphs and flow of funds/counterparties

[parse\_string.cpp](parse\_string.cpp)&#x20;

[parse\_string.h](parse\_string.h)

Converts strings to base64 (how is this different from encoding)

[pending.cpp](pending.cpp)

[pending.h](pending.h)

Manages pending tx in the mempool, freeing funds back into the wallet if they timeout

[persistence.cpp](persistence.cpp)

[persistence](persistence.h)[.h](https://github.com/patrickdugan/BlockPo-to-Tradelayer/commit/b7a149b5ca3cdd488b159f7a7b031d2b91f1aebd)

This is a soft secondary consensus mechanism that allows the LevelDB to boot off of recent checkpoints rather than having to reconstruct the entire archival history from genesis. It's like a super-consensus hash per 10k blocks.

[register.cpp](register.cpp)&#x20;

[register.h](register.h)&#x20;

The new data structure for managing the location and quantities of derivative positions.

[rpc.cpp](rpc.cpp)&#x20;

r[pc.h](rpc.h)

Defines all RPCs that do something informatic, no transactions.

[rpcpayload.cpp](rpcpayload.cpp)&#x20;

[rpcpayload.h](rpcpayload.h)&#x20;

Create OP\_Return payloads for any tx for use in multisig raw tx building

[rpcrawtx.cpp](rpcrawtx.cpp)

[rpcrawtx.h](rpcrawtx.h)

Utility RPCs for building raw transactions, includes adding OP\_Return.

[rpcrequireme](rpcrequirements.cpp)[nts.cpp](rpcrequirements.cpp)

[rpcrequirements.h](rpcrequirements.h)

Defines wallet related errors that may return when another RPC defined in the other files finds e.g. insufficient balance in the wallet.

[rpctx.cpp](rpctx.cpp)

rp[ctx.h](rpctx.h)

These are single-shot transaction triggering RPCs that assumes the private key is saved in the wallet.

[rpctxobject.cpp](rpctxobject.cpp)

[rpctxobject.h](rpctxobject.h)

Utility functions that other RPCs can use to look-up on-chain data about specific transactions.

[rpcvalues.cpp](rpcvalues.cpp)

[rpcvalues.](rpcvalues.h)[h](https://github.com/patrickdugan/BlockPo-to-Tradelayer/commit/96d58a9325411800f983f3b34daffbf2b793677f)

Utility functions for other RPC methods that look up intra-layer ledger values or on-chain data about balances.

[rules.cpp](rules.cpp)

[rules.h](rules.h)

This is where we invalidate tx for failing to fulfill criteria, this file refers to Activation to see which rules are which, Activation is essentially a Switch statement for opening up post-Activation rules from pre-Activation rules (where the new tx would be strange and always invalid).

[script.cpp](script.cpp)

[script.h](script.h)

Deals with scriptsigs and OP\_Return outputs at a Bitcoin compatability level

[sp.cpp](sp.cpp)

[sp.h](sp.h)

Defines smart property which includes contracts even though this also has a function for dealing out new sp-id numbers to new tokens, whereas the ce.cpp factors that role out for contracts. But since contracts are like tokens in that they are a thingie inside TradeLayer, sure they're smart property, technically the tokens aren't even that smart, these derivatives at least have a settlement and expiration or interest functions.&#x20;

[tally.cpp](tally.cpp)

The datastructure where tokens (but not contracts) live, and its methods.

t[ally.h](tally.h)

[tradelayer.cpp](tradelayer.cpp)

[tradelayer.h](tradelayer.h)

The big enchilada, contains early vestigial code from OmniLayer, for the posterity, a core loop, functions that define how to handle each OP\_Return we parse that has a recognized market and tx type, they get passed on to the other functions in the individual files. Validation is called from rules. If a tx is parsed as valid then it will make modifications to some data structure and get archived in LevelDB for easy RPC history searches.

[tradelayer\_matrices.h](tradelayer\_matrices.h)

Data structures created by Dr. Rubio when creating the original graph based settlement algo in order to crunch series of trades into abstracted models of graphs.

[tx.cpp](tx.cpp)

[tx.h](tx.h)

Where each tx type is defined and its behavior delegated out to whatever support files are needed.

[uint256\_extensions.h](uint256\_extensions.h)

[utilsbitcoin.cpp](utilsbitcoin.cpp)

[utilsbitcoin.h](utilsbitcoin.h)

[varint.cpp](varint.cpp)

v[arint.h](varint.h)

Self-explanatory support functions.

[version.cpp](version.cpp)

ve[rsion.](version.h)h

Simple version system not to be confused with canonical vector of activations in consensus hash.

[walletcache.cpp](walletcache.cpp)&#x20;

[walletcache.h](walletcache.h)&#x20;

This is what builds up the database of live positions from the underlying wallet.

[wallettxs.cpp](wallettxs.cpp)&#x20;

[wallettxs.h](wallettxs.h)&#x20;

Classic Bitcoin miner fee management and pubkey encoding.
