const tl = require('./TradeLayerRPCAPI.js')
const fs = require('fs')
const rest = require('restler')
const express = require('express')

var pass = ''
var user = ''
var noSign = true
var client = tl.init(user, pass, '', true)
var serverURI = 'http://192.155.93.12:76/api/'

//here we have the data schematic for encapsulating everything you'd need to managed your Trade Channels locally 
//server version would encapsulate channel management in the server, counterparty data you'd populate from the server
//channels you'd still manage locally, you'd just get the IPs from the server (server is like a VPN protecting home IP from exposure)
//txInventory would have a local copy but the server is doing the work of decoding so you trust the server in the sanity check function
var channelManager = {}
var channelManager.WSchannels ={'ip':'','status':'closed','heartbeat':1000,'channelName':'','counterpartyAlias':''}
var channelManager.counterparties = {'alias':'','ip':'','avgSignBackTime':0,'cancelRate':0,'regulatoryStatus':'unregulated',
									 'KYC':[0,1,2],'myHistoricalVolume':0}
//we can keep stats and do a simple .csv export of these tables, update avgSignBack and fidelity for each trade that lags/is shirked
var channelManager.multisigChannels = {'multisig': multisig, 'address1':address1, 'address2':address2,'WSChannelName':WSChannel,
									   'myAddr1':false, 'counterparty':{},'positions':[],'collateralid':1,
									   'myMargin':0,'myPNL':0,'counterpartyMargin':0}
var channelManager.txInventory = {'status':'intended','type':'LTC','mySide':'buy',
								'propertyid':0,'propertyid2':3,'amount':1,'amountDesired':55,
								'price':0,'firstSigner':true,'minerFeeSplit':0,'senderAddress':'','referenceaddress':''}

//tx status has six stages: intended, proposed, co-signed, signed-unpublished, pending-conf, confirmed
//tx type has 3 versions: LTC, token, contract
//my side is buy or sell, for contracts its simple, for LTC trades we consider the LTC spender to always be the buyer for propertyid2 
//for token we consider the buyer to be exchanging propertyid for propertyid 2 at the price=ratio of amount and amountDesired
//price will be interpreted if other things are null to define the ratios of LTC to tokens or token to token 
//for contract price is the direct param
//firstSigner is basically you're going to sign first, puts the free option risk in the dealer's hands to not abuse
//minerFeeSplit deals with the fine details of who is paying the fee, 0 implies the other guy, 
//-0.0004 implies you're getting a BTC or LTC rebate in that amount, 0.0004 implies you'll pay that much
//if these are RBF (which they should be) then the question of who pays when a replacement is needed... let's leave that for v2

channelManager.setWSChannels = function(dealers){
	var containsDealer = false
	for(var i=0; i<dealers.length;i++){
		var dealer = dealers[i]
		for(var w = 0; w<channelManager.WSchannels.length; w++){
			var channel = channelManager.WSchannels[w]
			if(channel.ip==dealer.ip){containsDealer==true}
		}
		
		if(containsDealer==false){
			//subscribes to indicator of interest websocket channel with dealer
			//generates nonce-like name
			//triggers setUpWSServer function to create new channel with a nonce-like name
			//rest or WS post call to trigger a process on dealer's side that 
			//causes them to subscribe to a specialized ws.feed with the parameter's URI name
			//and also to create a new websocket channel based on that name, and save that
			//then we save in channelManager.WSchannels an object containing these URIs
			//{'ip':'','incomingChannelName':'nonce name','outChannelName':'handshake param'}
		}
	}

}

channelManager.setUpWSServer = function(){
	//this sets up a new WS subscription for specialized channels
}

channelManager.maintainWSServer = function(){
	//this checks heartbeat on WS channels we're hosting/live subs and ideally returns a snapshot data object
}

channelMananger.listenFirstChannelProposal = function(address1,WSChannel,cb){
	//this creates a new multisig and returns it and the 2nd party's pubkey to the 1st party
	tl.getNewAddress(null,function(address2){
		tl.addMultisigAddress(2,[address1,address2],function(multisig){
			var obj = {'multisig': multisig, 'address1':address1, 'address2':address2,'WSChannelName':WSChannel,'myAddr1':false}
			//WS send-back obj
			channelMananger.multisigChannels.push(obj)
			cb(obj)
		})
	})
	
}

channelManager.listenChannelConfirmation = function(multisig, myAddr, address2,WSchannel){
	if(channelManager.multisigChannels.contains(WSchannel)&&myAddr==null){
		var myAddr = WSchannel.myAddr
	}else if(myAddr==null){
		//send WS message indicating an err, triggers flush of channel
	}
	tl.getAddressInfo(multisig,function(data){
		if(data.pubkeys.contains(address2)==true&&data.pubkeys.contains(myAddr){
			var obj= {'multisig':multisig,'address1':myAddr,'address2':address2,'WSchannel':WSchannel, 'myAddr1':true}
			channelMananger.multisigChannels.push(obj)
			cb(obj)
		}
	}
}

channelMananger.listenChannelErr = function(errMessage, multisigChannelObj, WSchannel){
	//flush multisig channel
}

channelManager.sendChannelErr= function(errMessage, multisigChannelObj, WSchannel)

channelMananger.messageToggleAvailability = function(availableBool, multisigChannelObj, WSchannel){
	//sends a true or false to indicate that the other trade should not expect a live quote, or that this is no longer the case
	//for instance market makers may run out of inventory temporarily and this helps alleviate expectations for liquidity
}

channelManager.checkTxDesirability = function(txObj, originalTx){

}

channelManager.queryDealers = function(minAvgLatency, maxRejectionRate, maxRejectionTime, minVolume, cb){
	//calls server to return data with the above params
	var thisURI = serverURI
	var wholeURI=thisURI+minAvgLatency+'/'+maxRejectionRate+'/'+maxReject
	rest.get(wholeURI).on('complete',function(data){
		channelManager.dealers = data
		return cb(data)
	})
}

channelManager.sendIndicatorOfInterest= function(contract, buySell,amount, price, specialType, secondSigner=true,cb){
	var thisURI = serverURI
	var wholeURI=thisURI+"sendIoI"
	if(specialType=='null'){specialType='limit'}
	var params = {'contract':contract,'buySell':buySell,'amount':amount,'price':price,'specialType':specialType,'secondSigner':secondSigner}
	rest.post(wholeURI,params).on('complete',function(data){
		return cb(data)
	})
}

//Replaces order api call.

channelManager.getBook= function(contract, amount, reputationMin, volumeMin, cb){

	//Returns an orderbook snapshot just like people are used to.
	var thisURI = serverURI
	rest.get(thisURI+minAvgLatency+'/'+maxRejectionRate+'/'+maxRejectionTime+'/'+minVolume).on('complete',function(data){
		return cb(data)
	})
}

channelManager.takeIndicatorOfInterest= function(contract, buySell, amount, price, specialType, firstSigner=true, pubkey,cb){
	
	//Liquidity taking, does carry risk of getting squeezed on the option value, but usually will come back confirming quickly. Pubkey is needed if no pre-existing channel has been established with the given offeror. But how is a user to know? The logic inside the wallet has to check its pre-established inventory, see if the quote lines up with any existing channels, transfer capital to a channel or otherwise establish if it not pre-existing, and then form/sign the proposed quote-match and send to the dealer. The particular atomicity of these quote-interactions, ideally, will be obscured by a two-click process.

	var thisURI = serverURI
	var wholeURI=thisURI+"takeIoI"
	if(specialType=='null'){specialType='limit'}
	var params = {'contract':contract,'buySell':buySell,'amount':amount,'price':price,'specialType':specialType,'firstSigner':firstSigner}
	rest.post(wholeURI,params).on('complete',function(data){
		return cb(data)
	})
}

channelManager.submitTX= function(txString,counterpartyAlias,direct,cb){
	if(direct ==false){
		var thisURI = serverURI
		var wholeURI=thisURI+"submitTX"
		if(specialType=='null'){specialType='limit'}
		var params = {'counterparty':counterpartyAlias,'txstring':txString}
		rest.post(wholeURI,params).on('complete',function(data){
			return cb(data)
		})
	}else if(direct==true){
		var thisURI = counterpartyAlias //we're assuming the CP alias is an IP address and thus a viable URI
		//WS channel look-up, match URI, use WS to broadcast string to that 1 subscriber channel
	}
}

//This passes the string back and forth

channelMananger.proposeChannel = function(pubkey,ipaddress, dealerid, cb){
	if(ipaddress==null){
		ipaddress=serverURI 
		var wholeURI = serverURI+"proposeChannel"
	}else{
		var wholeURI = ipaddress

		//ws call to other ip with pubkey parameter
	}
	if(dealerid==null){
		dealerid = "route"	
	}
	var params = {'pubkey':pubkey,'ipaddress':ipaddress,'dealerid':dealerid}
	rest.post(wholeURI,params).on('complete',function(data){
		return cb(data)
	})
}

channelManager.buildTransfer = function(cacheAddress, channelAddress, cacheInput, inputAmount, propertyid, amount, cb){
	//local RPC but node doesn't need to be online, same with other build functions
	tl.createpayload_transfer(propertyid,amount,function(payload){
		tl.buildRaw(payload,cacheInput,[0],channelAddress,inputAmount,function(txString){
			tl.simpleSign(txString,function(data){
				return cb(txString)
			})
			
		})
	})
}

channelManager.sendRaw= function(txString){
	tl.sendRawTransaction(txstring,function(txid){
		console.log(txid)
	})
}

channelManager.scanCommitsWithdrawals = function(multisigChannelObj,cb){
	//assumes local RPC use
	var channelCommitData = {firstAddressPendingCommits:[], firstAddressPendingWithdrawals:[],
						   secondAddressPendingCommits:[], secondAddressPendingWithdrawals:[],
						   firstAddressHistoricalCommits:[], firstAddressHistoricalWithdrawals:[],
						   secondAddressHistoricalCommits:[], secondAddressHistoricalWithdrawals: []
						   channel: multisigChannelObj
						   }
	tl.getChannelInfo(multisigChannelObj.multisig, function(data1){
			var first = data.firstAddress
			var second = data.secondAddress
	
		tl.listPendingTransactions(multisigChannelObj.multisig,function(data2){
			if(data2.length>1){
				var txids = []
				for(var i = 0; i<data2.length; i++){
					txids.push(data2[i].txid)
				}
			    var txDetails =	decodeTransactions(txids,[],0)
			    	for(var t = 0; t<txDetails.length; t++){
			    		var tx = txDetail[t]
			    		if(tx.type =="commit"&&tx.referenceAddress==multisigChannelObj.multisig){
			    			if(tx.senderAddress==first){
			    				channelCommitData.firstAddressPendingCommits.push(tx)
			    			}else if(tx.senderAddress==second){
			    				channelCommitData.secondAddressPendingCommits.push(tx)
			    			}
			    			//fix the name and object details later when you see the JSON from the decode
			    		}else if(tx.type =="withdrawal"&&tx.referenceAddress==multisigChannelObj.multisig){
			    			if(tx.senderAddress==multisigChannelObj.firstAddress){
			    				channelCommitData.firstAddressPendingWithdrawals.push(tx)
			    			}else if(tx.senderAddress==multisigChannelObj.secondAddress){
			    				channelCommitData.secondAddressPendingWithdrawals.push(tx)
			    			}
			    		}
			    	}
			}

				tl.getCommits(first,function(data3){
					channelCommitData.firstAddressHistoricalCommits.push(data3)
					tl.getWithdrawals(first,function(data4){
						channelCommitData.firstAddressHistoricalWithdrawals.push(data4)
						tl.getCommits(second,function(data5){
							channelCommitData.secondAddressHistoricalCommits.push(data5)
							tl.getWithdrawals(second,function(data){
									channelCommitData.secondAddressHistoricalWithdrawals.push(data)
									return cb(channelCommitData)
							})
						})
					})
				})
		})
	})
}

channelManager.reconcileCommitDataToChannelMap= function(channelCommitData){
	//loops through and updates values about inventory in ones active channels, the channelManager.multisigChannels array of objects
}

channelManager.decodeSentTransactions = function(txids,detailsArray,iterator){
	//assumes local RPC use
	tl.getTransaction(txids[iterator],function(data){
		detailsArray.push(data)
		iterator+=1
		if(iterator=txids.length){
				return detailsArray
		}else{
				return channelMananger.decodeSentTransactions(txids,detailsArray,iterator)
		}
	})
}

channelManager.decodeRawTransaction = function(rawstring, desiredtx, cb){
	//the idea here is that the desiredtx is fetched from the channelManager.txInventory array
	// and that contains inline the associated meta-data like inputs
	/*"OMNI": {
        "amount": "9.90000000",
        "confirmations": 0,
        "divisible": true,
        "fee": "0.00003465",
        "ismine": false,
        "propertyid": 31,
        "referenceaddress": "1DUb2YYbQA1jjaNYzVXLZ7ZioEhLXtbUru",
        "sendingaddress": "1DWQ1gZ8VhL1fUCABqKbXtUZv63roGvXf",
        "txid": "5451c8e67d7ab3f947064337e8cf87c416f1fb163630913dcf307d4ca5d5ccaa",
        "type": "Simple Send",
        "type_int": 0,
        "version": 0
    }*/
	tl.decodeRawTransaction(rawstring,null,0,function(data){
			if(data.OMNI.amount==desiredtx.amount
				&&data.OMNI.propertyid==desiredtx.propertyid
				&&data.OMNI.referenceaddress==desiredtx.referenceaddress
				&&data.OMNI.type==desiredtx.type    //note: update the formal tx type names to fit the encoding for txInventory
				&&data.OMNI.amount==desiredtx.amount){
				return cb(true) //this needs to also look at the LTC values in the inputs/outputs to check LTC trades, TODO
			}else{return cb(false)}
	})
}

channelManager.buildCommit = function(fromAddress,toAddress){
	tl.createpayload_commit()
}

channelManager.buildWithdraw = function(originalAddress,channelAddress){}

channelManager.buildWithdrawLocalWallet = function(addressSet){}

channelManager.buildTokenToTokenTrade = function(channeladdress, id1,amount, id2, amount, secondSigner=true,cb){
	tl.getBlock(null,function(data){
		var height = data.height+3
		tl.createpayload_instant_trade(id1, amount, height, id2, amount2, function(payload){
			tl.buildRaw(payload,multisigInput,[0],tokenSellerAddress,0.00000546, function(txString){
					return cb(data)
			})
		})
	}
}

channelManager.buildLTCTokenTrade = function(channeladdress, channelInput, tokenSellerAddress, propertyid, amountOfTokens, LTCPrice, blockheight_expiry, secondSigner=true,cb){
	tl.getBlock(null,function(data){
		var height = data.height+3
		tl.createpayload_instant_LTC_trade(propertyid, amount, blockheight_expiry, LTCPrice, function(payload){
			tl.buildRaw(payload,channelInput,[0],tokenSellerAddress,UXTOAmount, function(txString){
				tl.fundRawTransaction(txstring,{'replaceable':true},function(data){
					return cb(data)
				})
			})
		})
	}
} 

channelManager.buildContractTrade = function(channeladdress, channelInput, contractid,amount, buySell, secondSigner=true,cb){
	var leverage = 10
	if(buySell=='buy'){buySell=1}else if(buySell=='sell'){buySell=2}
	tl.getBlock(null,function(data){
		var height = data.height+3
		tl.createpayload_contract_instant_trade(contractid, amount, height, price, buySell, leverage, function(payload){
			tl.buildRaw(payload,channelInput,[0],null,0.00000546, function(txString){
				tl.fundRawTransaction(txstring,{'replaceable':true},function(data){
					return cb(data)
				})
			})
		})
	}
}

//Prompts to initiate creation of a new multisig channel via the server relay with a new counterparty. This would flow in the wallet, such that the client code would pingback information about the quote the user selected, then ping this call, then returning a new channel, propose the part-signed tx to the channel.
