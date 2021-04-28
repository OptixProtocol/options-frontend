import Web3 from "web3";
import { store } from "./Store";
import { EventBus } from "./EventBus";
import ERC20OptionsAPI from "./ERC20Options";

var LiquidityPoolAPI = {

  async getTokenPoolCount() {    
    return await store.contracts.ERC20LiquidityPool.methods
      .tokenPoolCount()
      .call();
  },

  async getOptionMarketCount() {    
    return await store.contracts.ERC20LiquidityPool.methods
      .optionMarketCount()
      .call();
  },

  async getTotalSupply() {    
    return await store.contracts.ERC20LiquidityPool.methods
      .totalSupply(store.getSelectedTokenContractAddress())
      .call();
  },
    
  async getLockedAmount() {    
    return await store.contracts.ERC20LiquidityPool.methods
      .lockedAmount(store.getSelectedTokenContractAddress())
      .call();
  },

  async getLockedPremium() {    
    return await store.contracts.ERC20LiquidityPool.methods
      .lockedPremium(store.getSelectedTokenContractAddress())
      .call();
  },

  async getTotalBalance() {    
      return await store.contracts.ERC20LiquidityPool.methods
      .totalBalance(store.getSelectedTokenContractAddress())
      .call();
  },
        
  async getAvailableBalance() {    
    return await store.contracts.ERC20LiquidityPool.methods
      .availableBalance(store.getSelectedTokenContractAddress())
      .call();
  },

  async getWriterBalanceOf() {    
    return await store.contracts.ERC20LiquidityPool.methods
      .writerBalanceOf(store.userAccount,store.getSelectedTokenContractAddress())
      .call();
  },
   
  async getShareOf() {    
    return await store.contracts.ERC20LiquidityPool.methods
      .shareOf(store.userAccount,store.getSelectedTokenContractAddress())
      .call();
  },

  async getLastProvideTimestamp() {
    
    return await store.contracts.ERC20LiquidityPool.methods
      .lastProvideTimestamp(store.getSelectedTokenContractAddress(),store.userAccount)
      .call();
  },

  async getLockupPeriod(){
    return await store.contracts.ERC20LiquidityPool.methods
      .lockupPeriod(store.getSelectedTokenContractAddress())
      .call();
  },

  async getMaxInvest(){
    return await store.contracts.ERC20LiquidityPool.methods
      .maxInvest(store.getSelectedTokenContractAddress())
      .call();
  },  

  // async getLockedLiquidity(tokenAddress) {    
  //   return await store.contracts.ERC20LiquidityPool.methods
  //     .lockedLiquidity(tokenAddress)
  //     .call();
  // },
  
  async getTokenPoolList() {
    if (store.tokenPoolList == null) {
      store.tokenPoolList = [];
      store.tokenPoolContracts = [];
      store.tokenPoolHash = {};

      let cnt = await this.getTokenPoolCount();
      // console.log("cnt:", cnt);
      for (var i = 0; i < cnt; i++) {
        let contract = await this.getTokenContractForPool(i);
        // console.log("contract:", contract._address);
        if (store.exclude.poolAddress.includes(contract._address)){
          continue;
        }
        let symbol = await contract.methods.symbol().call();
        let pool = { value: i, text: symbol }
        store.tokenPoolList.push(pool);
        store.tokenPoolContracts.push(contract);
        store.tokenPoolHash[i] = pool;
      }
    }
    return store.tokenPoolList;
  },

  async getMarketList() {
    let tmpList;
    let tmpHash;
    if (store.marketList == null) {
      tmpList = [];
      tmpHash = {};

      let cnt = await this.getOptionMarketCount();    
      // console.log("cnt:", cnt);
      for (var i = 0; i < cnt; i++) {

        if (store.exclude.marketIds.includes(i)){
          continue;
        }

        let tc = await this.getTokenContractForMarket(i);
        let collateral = await tc.methods.symbol().call();

        let desc = await (await this.getChainLinkAggregatorContract(i)).methods.description().call();
        let idx = desc.indexOf("/")
        let pair1 = desc.substring(0, idx - 1);
        let pair2 = desc.substring(idx + 2)
        
        // console.log("iiiii:",i)
        let lp = await ERC20OptionsAPI.getLatestPrice(i);
        // let lp = 500000;
        
        // console.log(desc)
        let option = {value:i, text:pair1 + " : "+ collateral, pair1:pair1, pair2:pair2, collateral:collateral, latestPrice:lp}
        tmpList.push(option);

        tmpHash[i] = option;        
      }
      store.marketList = tmpList;
      store.marketHash = tmpHash;
      return tmpList;
    }
    return store.marketList;
  },

  async getChainLinkAggregatorContract(marketId) {
    let address = await store.contracts.ERC20LiquidityPool.methods
      .priceProvider(marketId)
      .call();
      let w3 = new Web3(store.userWeb3Provider);
      return new w3.eth.Contract(
        store.abis.ChainLinkAggregator,
        address
      );    
  },

  async getChainLinkDescription(marketId) {
    return await (await this.getChainLinkAggregatorContract(marketId)).methods.description().call();
  },

  async getTokenContractForMarket(marketId) {
    // console.log("marketId:", marketId);
    // console.log("store.userWeb3Provider:", store.userWeb3Provider)
    // console.log("store.contracts.ERC20LiquidityPool:",store.contracts.ERC20LiquidityPool)


    let address = await store.contracts.ERC20LiquidityPool.methods
      .collatoralToken(marketId)
      .call();

      let w3 = new Web3(store.userWeb3Provider);
      return new w3.eth.Contract(
        store.abis.ERC20,
        address
      ); 
  },

  async getTokenContractForPool(poolId) {
    let address = await store.contracts.ERC20LiquidityPool.methods
      .tokenPool(poolId)
      .call();

      let w3 = new Web3(store.userWeb3Provider);
      return new w3.eth.Contract(
        store.abis.ERC20,
        address
      ); 
  },

  async setProvide(amount) {

    await store.contracts.ERC20LiquidityPool.methods
      .provide(amount, 0, store.getSelectedTokenContractAddress())
      .send({ from: store.userAccount })
      .on(
        "transactionHash",
        function (hash) {
          // console.log(1);
          EventBus.$emit("setProvide:transactionHash");
        }.bind(this)
      )
      .on(
        "confirmation",
        function (confirmationNumber, receipt) {
          // console.log(2);
          EventBus.$emit("setProvide:confirmation");
        }.bind(this)
      )
      .on(
        "receipt",
        function (receipt) {
          // console.log(3);
          EventBus.$emit("setProvide:receipt");
        }.bind(this)
      )
      .on(
        "error",
        function (error, receipt) {
          // console.log(4);
          EventBus.$emit("setProvide:error");
        }.bind(this)
      );
  },

  async setWithdraw(amount) {

    await store.contracts.ERC20LiquidityPool.methods
      .withdraw(amount, "999999999999999999999999999999999999999999999999999999", store.getSelectedTokenContractAddress())
      .send({ from: store.userAccount })
      .on(
        "transactionHash",
        function (hash) {
          // console.log(1);
          EventBus.$emit("setWithdraw:transactionHash");
        }.bind(this)
      )
      .on(
        "confirmation",
        function (confirmationNumber, receipt) {
          // console.log(2);
          EventBus.$emit("setWithdraw:confirmation");
        }.bind(this)
      )
      .on(
        "receipt",
        function (receipt) {
        // console.log(3);
          EventBus.$emit("setWithdraw:receipt");
        }.bind(this)
      )
      .on(
        "error",
        function (error, receipt) {
          // console.log(4);

          EventBus.$emit("setWithdraw:error");
        }.bind(this)
      );
  }, 

  async setApproveWriterPool(amount) {
    //  console.log("store.userAccount",store.userAccount);
    await store.contracts.WriterPool.methods
      .setApprovalForAll(store.addresses.ERC20LiquidityPool,true).send({ from: store.userAccount })
  },
}

export default LiquidityPoolAPI