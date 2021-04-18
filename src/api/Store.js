import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Connect from "web3connect";
import { EventBus } from "../api/EventBus";
import LiquidityPoolAPI from "../api/LiquidityPool";

const infuraId = "936de429817143ed994d266ab90ca264";


export const store = {
  state: {
    provider: null,
    web3,
    web3Connected: false,

    infuraWeb3: null,
    infuraWeb3Connected: false,
    infuraProvider: null,

    userWeb3: null,
    userWeb3Connect: null,
    userWeb3Connected: false,
    userWeb3Provider: null,
    userAccount: null,

    contracts: null,    
    addresses: null,
    abis: null,

    liquidityPool: [],
    selectedMarketId: 10,
    selectedPoolId: 0,

    marketList: null,
    tokenPoolList: null,
    tokenPoolContracts: null,


    myOptions: null,
    selectedTokenContract: null,
    selectedTokenContractAddress: null,

    networkIsSupported: false,
    networkIsMainnet: false
  },

 

  
  getSelectedTokenContract() {
    return store.selectedTokenContract;
  },

  getSelectedTokenContractAddress() {
    return store.selectedTokenContractAddress;
  },
  async setSelectedPoolId(_poolId) {
    store.selectedPoolId = _poolId;
    let contract = await LiquidityPoolAPI.getTokenContractForPool(_poolId);
    store.selectedTokenContract = contract;
    store.selectedTokenContractAddress = contract._address
  },
  async setSelectedMarketId(_marketId) {    
    store.selectedMarketId = _marketId;
    let contract = await LiquidityPoolAPI.getTokenContractForMarket(_marketId);
    store.selectedTokenContract = contract;
    store.selectedTokenContractAddress = contract._address;
  },


  async connectUser() {
    if (store.userWeb3Connected) {
      if (store.userWeb3Provider.close) {
        store.userWeb3Provider.close();
      }
      if (store.userWeb3Connect) {
        store.userWeb3Connect.clearCachedProvider();
      }
      store.userWeb3Provider = null;
      store.userWeb3 = null;
      store.userWeb3Connected = false;
      store.userAccount = null;    
      
      // await this.initInfura();
      EventBus.$emit("userWeb3Disconnected");
    }
    else {
      store.userWeb3Connect = new Web3Connect.Core({
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: { infuraId },
          },
        }
      });

      
      var provider = await store.userWeb3Connect.connect();
      store.userWeb3Provider = provider;
      store.userWeb3 = new Web3(provider);
      store.userWeb3Connected = true;
    
      store.contracts = [];    
      store.contracts.ERC20LiquidityPool = new store.userWeb3.eth.Contract(
        store.abis.ERC20LiquidityPool,
        store.addresses.ERC20LiquidityPool
      )
      store.contracts.ERC20Options = new store.userWeb3.eth.Contract(
        store.abis.ERC20Options,
        store.addresses.ERC20Options
      );
      store.contracts.WriterPool = new store.userWeb3.eth.Contract(
        store.abis.WriterPool,
        store.addresses.WriterPool
      )


      store.userAccount = (await store.userWeb3.eth.getAccounts())[0];

      //reload them with the users web3, not infura
      store.tokenPoolList = null;
      store.marketList = null;

      // await LiquidityPoolAPI.getTokenPoolList();
      // await LiquidityPoolAPI.getMarketList();
      // console.log("store.selectedMarketId:",store.selectedPoolId)
      // await store.setSelectedMarketId(this.selectedMarketId);
      
      EventBus.$emit("userWeb3Connected");
    }
  }
}