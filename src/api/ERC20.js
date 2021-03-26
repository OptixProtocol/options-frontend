
// import Web3 from "web3";
import { store } from "../api/Store";
// import LiquidityPoolAPI from "../api/LiquidityPool";
import { EventBus } from "../api/EventBus";

var ERC20API = {

  async getUserBalance() {
    if (store.userAccount == null)
      return 0;
    // console.log(account);
    let balance = await store.getSelectedTokenContract().methods
    return balance;
  },

  async getPoolBalance() {
    let balance = await store.getSelectedTokenContract().methods
      .balanceOf(store.addresses.ERC20LiquidityPool).call();    
    return balance;
  },

  async getAllowanceLiqudityPool() {
    if (store.userAccount == null)
      return 0;
    let allowance = await store.getSelectedTokenContract().methods
      .allowance(store.userAccount, store.addresses.ERC20LiquidityPool).call();
    // console.log("allowance",allowance);
    return allowance;
  },

  async getAllowanceERC20Options() {
    if (store.userAccount == null)
      return 0;
    let allowance = await store.getSelectedTokenContract().methods
      .allowance(store.userAccount,store.addresses.ERC20Options).call();
    return allowance;
  },


  async setApproveLiqudityPool(amount) {
    //  console.log("store.userAccount",store.userAccount);
    await store.getSelectedTokenContract().methods
      .approve(store.addresses.ERC20LiquidityPool, amount).send({ from: store.userAccount })
    .on(
        "transactionHash",
        function (hash) {
        EventBus.$emit("ERC20:setApproveLiqudityPool:transactionHash");
        // Hash created...
        }.bind(this)
    )
    .on(
        "confirmation",
        function (confirmationNumber, receipt) {
            EventBus.$emit("ERC20:setApproveLiqudityPool:confirmation");
            // Transaction Confirmed
        }.bind(this)
    )
    .on(
        "receipt",
        function (receipt) {
            EventBus.$emit("ERC20:setApproveLiqudityPool:receipt");
        }.bind(this)
    )
    .on(
        "error",
        function (error, receipt) {
            EventBus.$emit("ERC20:setApproveLiqudityPool:error");
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        }.bind(this)
    );      
  },

  async setApproveERC20Options(amount) {
    console.log("approve amt:", amount.toString());
    console.log("approve address:", store.addresses.ERC20Options);
    console.log("approve store.userAccount:", store.userAccount);
    
    await store.getSelectedTokenContract().methods
      .approve(store.addresses.ERC20Options, amount).send({ from: store.userAccount })
    .on(
        "transactionHash",
        function (hash) {
        EventBus.$emit("ERC20:setApproveERC20Options:transactionHash");
        // Hash created...
        }.bind(this)
    )
    .on(
        "confirmation",
        function (confirmationNumber, receipt) {
            EventBus.$emit("ERC20:setApproveERC20Options:confirmation");
            // Transaction Confirmed
        }.bind(this)
    )
    .on(
        "receipt",
        function (receipt) {
            EventBus.$emit("ERC20:setApproveERC20Options:receipt");
        }.bind(this)
    )
    .on(
        "error",
        function (error, receipt) {
            EventBus.$emit("ERC20:setApproveERC20Options:error");
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        }.bind(this)
    );    
  }

}

export default ERC20API