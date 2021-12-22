---
description: How to build more inline DeFi
---

# Creating a new TradeLayer Tx

1. Define the tx number and core functions in tx.cpp
2. Define the invalidation criteria of the tx in rules.cpp
3. Define a new file ideally with the class definitions and core functions of your tx that provides support functions called in tx.cpp
4. Create a function in tradelayer.cpp to handle the tx when parsed and start the chain of calls in tx.cpp
5. Update persistence.cpp and consensushash.cpp to account for any state changes resulting from the tx (if there's no new data structure then just persistence).
6. Create RPC calls relating to information support of the new object&#x20;
7. Create payload RPC call to build it multisig
8. Create single-sig RPC tx call to just do it in a wallet
9. Add the if/then about the tx to a batch of activations in activations.cpp
10. Test it on regtest using the .py tools and on testnet using .js or .py RPC calling scripts
11. Activate on mainnet
