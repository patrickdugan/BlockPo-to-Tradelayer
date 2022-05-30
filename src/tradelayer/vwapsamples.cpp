#include <tradelayer/tradelayer.h>
#include <tradelayer/vwapsamples.h>

namespace tl
{

std::vector<int64_t> get_vwap1(const std::map<std::string,Channel>& data, const std::string& address, uint32_t pid, int nBlocks)
{
    // Sort channels by block
    std::vector<Channel> channels;
    std::for_each(data.begin(), data.end(), [&](const std::pair<std::string,Channel>& p) { channels.push_back(p.second); });
    std::sort(channels.begin(), channels.end(), [](const Channel& a, const Channel& b) { return a.getLastBlock() < b.getLastBlock(); });

    std::vector<int64_t> vwap;
    vwap.resize(nBlocks);

    int n = 0, b = 0;
    for (auto c = channels.rbegin(); c != channels.rend(); ++c) 
    {
        // Count blocks
        if (c->getLastBlock() != b) 
        {
            b = c->getLastBlock();
            ++n;
        }

        // Lookup an asset at the address
        if (c->isPartOfChannel(address)) 
        {
            auto& bmap = c->getBalanceMap();
            
            auto m1 = bmap.find(address);
            if (m1 == bmap.end()) continue;
            auto m2 = m1->second.find(pid);
            if (m2 == m1->second.end()) continue;
            
            vwap.emplace_back(m2->second);
        }

        if (n > nBlocks-1) break;
    }

    return vwap;
}

std::map<int, P64> get_vwap2(const std::map<int, V64>& data, std::initializer_list<int> nBlocks)
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

int64_t get_vwap3()
{
    // RoundDown(WeighedAvg(Volatility_Samples)%0.005+1)
    return 0;
}

} // namespace tl