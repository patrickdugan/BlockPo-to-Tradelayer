---
description: We're going to need a bigger data structure...
---

# Understanding the Settlement, Trade Channels, Fees, Insurance, Margin Pentangle

We pushed the limits of OP\_Return data structures by building out all the scaffolding to get to on-chain derivatives.

Here's how it works:

1\) trade a derivative using the old xTrade matching logic function - or - a Trade Channel. A TC trade is recorded when it confirms, without having to go through xTrade.&#x20;

2\) the Tallymap is updated by reserving initial margin and the Register is updated by creating a new position. On the Register there are an equal number of long and short balances for each type of contract.

3\) every block a mark price updates based on the VWAP of the underlying spot trading pair or the TWAP of the last few oracle publications, this goes through the settlement function which checks:

&#x20; a) does this new price trigger any liquidations

&#x20; b) do these liquidations get filled on the on-chain orderbook

&#x20; c) if no then we have a number of contracts left on the orderbook at their bankruptcy price

&#x20; d) is the VWAP of these unfilled liquidations vs. the mark price times the # of liquidated contracts # the notional size, bigger... than the balance in the insurance fund (if activated) if not then insurance pays for it (later the insurance fun would have an inventory of 1x hedged short contracts for the native ALL/LTC perp, to be buyer of last resort to a point).

&#x20; e) if the damage is greater than available insurance funds we pay that all out then get into socialization, this penalizes the payment to profitable shorts (given that the native contracts are inverse quoted it makes sense to worry about liquidated longs), and moves the wall of liquidated orders down to the mark price of the previous settlement



Fees are set aside in Fee Caches, which are myriad accounting cubbyholes inside the TradeLayer state, they wait for an on-chain ALL for token order to appear so they token cache can (in sufficient quantity) automatically cross the book and buy that ALL to put in the insurance fund. Future versions of the insurance fund should also absorb half of the fee cache directly and spot buy ALL in a crash.

Trade Channels should have their logic factored out of tradelayer.cpp

Fee behavior along with the bi-direction Channel trade clearing is defined in mdex.cpp, a lot of the vestigial data structures from the Rubio clearing algo are in place, but at this point these mostly need to correspond to the labels in the derivatives Register. There are other references to fees in the handler functions in tradelayer.cpp for the relevant trading tx types.

We need to add an insurance.cpp/.h to define the input/output functions for the fees going in and the short-covers or payouts coming out it.

Much of this is on mdex.cpp, the settlement part is in the middle of tradelayer.cpp

