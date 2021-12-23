---
description: The decentralized stablecoin you deserve
---

# Understanding dMoney

dMoney is basically a 1x hedged swap position that is wrapped for transferability, and includes a redemption function and a rebase function to account for positive and negative interest payments. Currently there are 3 functions in tradelayer.cpp



// The idea is have tools to see the origin of pegged currency created !!! void CMPTradeList::NotifyPeggedCurrency(const uint256& txid, string address, uint32\_t propertyId, uint64\_t amount, std::string series) { if (!pdb) return; const string key = txid.ToString(); const string value = strprintf("%s:%d:%d:%d:%s",address, propertyId, GetHeight(), amount, series); // PrintToConsole ("saved: s% : %s\n",key,value); Status status; if (pdb) { status = pdb->Put(writeoptions, key, value); ++ nWritten; // if (msc\_debug\_tradedb) PrintToLog("%s(): %s\n", **FUNCTION**, status.ToString()); } }



// addInterestPegged(nBlockPrev,pBlockIndex)

This is near the start of the core handler function that loops every block, needs to be refactored to handle positive and negative interest.



bool CMPTradeList::getCreatedPegged(uint32\_t propertyId, UniValue& tradeArray) { if (!pdb) return false;

```
int count = 0;
std::vector<std::string> vstr;
leveldb::Iterator* it = NewIterator(); // Allocation proccess

for(it->SeekToFirst(); it->Valid(); it->Next()) {
    // search key to see if this is a matching trade
    const std::string& strKey = it->key().ToString();
    const std::string& strValue = it->value().ToString();

    // ensure correct amount of tokens in value string
    boost::split(vstr, strValue, boost::is_any_of(":"), token_compress_on);
    if (vstr.size() != 5) {
        // PrintToLog("TRADEDB error - unexpected number of tokens in value (%s)\n", strValue);
        continue;
    }

    // decode the details from the value string
    const uint32_t propId = boost::lexical_cast<uint32_t>(vstr[1]);

    if (propId != propertyId) {
       continue;
    }

    const std::string& address = vstr[0];
    const int64_t height = boost::lexical_cast<int64_t>(vstr[2]);
    const int64_t amount = (boost::lexical_cast<int64_t>(vstr[3]) / COIN);
    const std::string& series = vstr[4];

    // populate trade object and add to the trade array, correcting for orientation of trade
    UniValue trade(UniValue::VOBJ);

    trade.push_back(Pair("creator address", address));
    trade.push_back(Pair("height", height));
    trade.push_back(Pair("txid", strKey));
    trade.push_back(Pair("amount created", amount));
    trade.push_back(Pair("series", series));
    tradeArray.push_back(trade);
    ++count;
}
// clean up
delete it; // Desallocation proccess
if (count) { return true; } else { return false; }
```

}

This parses the creation tx and applies logic, included in this is a serial number tying it back to its original reserve address. This was functional years ago so maybe we can get it refurbished without a refactor by adding property id logic to discriminate about ALL minting sLTC first, and then one can take sLTC and create USDL-xx where the xx is the contract id of the native contract it uses. Then we liberate native contracts to use oracles and spot pairs in basket indices and we've got a good system to test.

