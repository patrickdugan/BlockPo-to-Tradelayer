#include <tradelayer/vwapsamples.h>
#include <tradelayer/tradelayer.h>
#include <tradelayer/rpctxobject.h>

namespace tl
{

namespace mc = mastercore;

bool FindChannelTrade(const Channels& data, const std::string& address, uint32_t pid, int nBlocks)
{
    // Build set of blocks for this trade 
    std::set<int> blocks;
    std::vector<uint256> txArray;
    {
        LOCK(cs_tally);
        std ::string ch;
        if (!mc::t_tradelistdb->checkChannelRelation(address, ch))
        {
            // hasn't traded in a channel
            return false;
        }
        mc::t_tradelistdb->getTradesForAddress(address, txArray, pid);
    }
    for(auto tx : txArray) 
    {
        UniValue v(UniValue::VOBJ);
        if (0 == populateRPCTransactionObject(tx, v))
        {
            blocks.emplace(v["block"].get_int());
        }
    }

    // Assume no trade has been found
    if (blocks.empty())
    {
        return false;
    }

    // Sort channels by block
    std::vector<Channel> channels;
    std::for_each(data.begin(), data.end(), [&](const std::pair<std::string,Channel>& p) { channels.push_back(p.second); });
    std::sort(channels.begin(), channels.end(), [](const Channel& a, const Channel& b) { return a.getLastBlock() < b.getLastBlock(); });

    int n = 0, b = 0;
    for (auto c = channels.rbegin(); c != channels.rend(); ++c) 
    {
        // Count blocks
        if (c->getLastBlock() != b) 
        {
            b = c->getLastBlock();
            ++n;
        }

        if (!c->isPartOfChannel(address)) 
        {
            continue;
        }
                
        if (blocks.find(b) != blocks.end())
        {
            return true;
        }

        if (n > nBlocks-1) break;
    }

    return false;
}

std::map<int, P64> GetVWAPSamples(const std::map<int, V64>& data, std::initializer_list<int> nBlocks)
{
    std::map<int, P64> vwap;

    for (size_t n : nBlocks) 
    {
        if (data.size() < n) {
            break;
        }

        std::set<int64_t> set1;
        std::set<int64_t> set2;

        for (auto end=data.cend(), start=std::next(end,-n); start!=end; std::next(start)) 
        {
            auto& v64 = const_cast<V64&>(start->second);
            if (v64.size()) 
            {
                std::sort(v64.begin(), v64.end(), [](const P64& a, const P64& b) { return a.first < b.first; });
                set1.insert(v64.cbegin()->first);
                set2.insert(std::prev(v64.cend())->first);
            }
        }

        auto mn = set1.size() ? *set1.begin() : 0L;
        auto mx = set2.size() ? *std::prev(set2.end()) : 0L;

        vwap[n] = std::make_pair(mn, mx);
    }
    
    return vwap;
}

int64_t AntiWashFilter(const Channels& data, const std::string& address, uint32_t pid)
{
    // RoundDown(WeighedAvg(Volatility_Samples)%0.005+1)
    //first get the volatility %
    
    //I'm confused by the flow here because it seems like you're looping for different values of the volatility parameters... but 
    //this function takes a single pid, so the commented out first line is what I'd expect there.
    
    //here we'll make a math soup of these volatility samples
    // int nBlocks = min(((vol50+vol10)/2),(vol00+vol500+vol1000)/3)) 
    // this maybe is a dumb formula but it's easy to change
    
    //this kind of loop could be useful for producing the map passed to GetVWAPSamples, 
    //but I think you'd want to call FindChannelTrade insight the GetVWAPSample?
    //they could both work
    for (auto b : {10, 50, 100, 500, 1000})
    {
        if (!FindChannelTrade(data, address, pid, b))
            continue;
    }

    //auto vmmap = tl::GetVWAPSamples(c->second, {10, 50, 100, 500, 1000}); 
    
    //here we might also take the nBlocks value and calculate an associated increase in the on-chain orderbook fees/rebate, but let's save that for another iteration
    
    //here you'd return the integer value for the filtered VWAP
    return 0;
}

} // namespace tl
