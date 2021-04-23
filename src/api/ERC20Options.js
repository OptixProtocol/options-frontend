import Web3 from "web3";
import { store } from "../api/Store";
import LiquidityPoolAPI from "../api/LiquidityPool";
import { EventBus } from "../api/EventBus";
import axios from 'axios';

var ERC20OptionsAPI = {
    OptionType: { Invalid:0, Put:1, Call:2 },
    OptionState:  {Inactive:0, Active:1, Exercised:2, Expired:3},

    async getProtocolFee() {
        let protocolFee = await store.contracts.ERC20Options.methods
            .protocolFee()
            .call();
        return protocolFee;
    },

    
    async getLatestPrice(marketId) {
        const _marketId = (marketId || store.selectedMarketId);        
        // console.log("store.contracts.ERC20Options:", store.contracts.ERC20Options);
        // console.log("_marketId:", marketId);
        let latestPrice = await store.contracts.ERC20Options.methods
            .latestPrice(_marketId)
            .call();
        // console.log("latestPrice:", latestPrice);
        return latestPrice * 10;
    },

  
    async getPremium(period, optionSize, strikePrice, optionType) {    
        // console.log("<<Premium>>")
        // console.log("period:" +period);
        // console.log("optionSize:" +optionSize.toFixed(0).toString());
        // console.log("strikePrice:" +strikePrice);
        // console.log("optionType:" +optionType);
        // console.log("optionMarketId:" + store.selectedMarketId);
        // console.log("store.userAccount:" + store.userAccount);        
        return await store.contracts.ERC20Options.methods
            .premium(period, optionSize.toFixed(0).toString(), strikePrice.toString(), optionType, store.selectedMarketId)
            .call();
    },


    async getFees(period, optionSize, strikePrice, optionType) {
        // console.log("<<Fees>>")
        // console.log("period:" +period);
        // console.log("optionSize:" +optionSize.toFixed(0).toString());
        // console.log("strikePrice:" +strikePrice.toString());
        // console.log("optionType:" +optionType);
        // console.log("optionMarketId:" + store.selectedMarketId);                
        return await store.contracts.ERC20Options.methods
            .fees(period, optionSize.toFixed(0).toString(), strikePrice.toString(), optionType, store.selectedMarketId)
            .call();
    },
   
    async getMyOptionsGraphQL() {
    if (store.userAccount == null) {
        return [];
    }

    const res = await axios.post(
        'https://api.thegraph.com/subgraphs/name/dannydoritoeth/optyn', {
        query: `        
        {
            options(where: { holder : "{{holder}}"}) {
            id
            creationBlock
            creationTimestamp
            holder 
            }
        }
        `.replace("{{holder}}",store.userAccount.toLowerCase())
        })
        console.log(res.data.data.options);

// creationBlock: "13566851"
// creationTimestamp: "1619045395"
// holder: "0xd445d873d0edc0cd35ff4f61b334df8b7b822b1b"
// id: "5"


        let options = [];
        let lastFoundID = -1;
        let lastFoundOption = null;
        await Promise.all(
            res.data.data.options
                .map((x) => x.id)
                .map((id) =>
                    store.contracts.ERC20Options.methods
                        .options(id)
                        .call()
                        .then((x) => {
                            const option = { ...x, id };
                            if (!res.data.data.options.includes(id)) {
                                option.log = res.data.data.options[id];
                                options.push(option);
                            } else
                                options.filter((x) => x.id == id)[0].state = x.state;
                            if (
                                id > lastFoundID &&
                                x.state == 1 &&
                                Date.now() < x.expiration * 1000
                            ) {
                                lastFoundOption = option;
                                lastFoundID = id;
                            }
                        })
                )
        );        
        options.sort((x, y) => y.id - x.id);
        store.myOptions = options;

        return options;
    },

    async getMyOptions() {
        
        if (store.userAccount == null) {
            return [];
        }
            

        store.myOptions = [];
        let options = [];
        let lastFoundOption = null;
        let lastFoundID = -1;
        let optionLogs = await store.contracts.ERC20Options.getPastEvents("Create", {
            fromBlock: 0,
            filter: { account: store.userAccount },
        });

        await Promise.all(
            optionLogs
                .map((x) => x.returnValues.id)
                .map((id) =>
                    store.contracts.ERC20Options.methods
                        .options(id)
                        .call()
                        .then((x) => {
                            const option = { ...x, id };
                            if (!optionLogs.includes(id)) {
                                option.log = optionLogs[id];
                                options.push(option);
                            } else
                                options.filter((x) => x.id == id)[0].state = x.state;
                            if (
                                id > lastFoundID &&
                                x.state == 1 &&
                                Date.now() < x.expiration * 1000
                            ) {
                                lastFoundOption = option;
                                lastFoundID = id;
                            }
                        })
                )
        );        
        options.sort((x, y) => y.id - x.id);
        store.myOptions = options;
        return options;
    },
   
    async setBuy(period, optionSize, strikePrice, optionType) {
        // console.log("<<Buy>>")
        // console.log("period:" +period);
        // console.log("optionSize:" +optionSize);
        // console.log("strikePrice:" +strikePrice);
        // console.log("optionType:" +optionType);
        // console.log("optionMarketId:" + store.selectedMarketId);
        // console.log("store.userAccount:" + store.userAccount);

        let contract = new store.userWeb3.eth.Contract(
            store.abis.ERC20Options,
            store.addresses.ERC20Options
        );

        let optionId = await contract.methods
           .create3(period, optionSize, strikePrice, optionType, store.selectedMarketId)
            .send({ from: store.userAccount })
            .on(
                "transactionHash",
                function (hash) {
                EventBus.$emit("ERC20Options:create:transactionHash");
                // Hash created...
                }.bind(this)
            )
            .on(
                "confirmation",
                function (confirmationNumber, receipt) {
                    EventBus.$emit("ERC20Options:create:confirmation");
                    // Transaction Confirmed
                }.bind(this)
            )
            .on(
                "receipt",
                function (receipt) {
                    EventBus.$emit("ERC20Options:create:receipt");
                }.bind(this)
            )
            .on(
                "error",
                function (error, receipt) {
                    EventBus.$emit("ERC20Options:create:error");
                    // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                }.bind(this)
            );        
       return optionId;
    },
   
    async setExercise(optionId, poolId) {
        let contract = new store.userWeb3.eth.Contract(
            store.abis.ERC20Options,
            store.addresses.ERC20Options
        );
        let exerciseEvent = await contract.methods
            .exercise(optionId)
            .send({ from: store.userAccount })
            .on(
                "receipt",
                function (receipt) {
                    EventBus.$emit("ERC20Options:exercise:receipt");
                }.bind(this)
            );                  

        return exerciseEvent;
    },
}

export default ERC20OptionsAPI