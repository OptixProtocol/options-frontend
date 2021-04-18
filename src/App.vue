<template>
  <router-view></router-view>
</template>

<script>
import { store } from "./api/Store";
import Addresses from "./static/Addresses.json";
import ChainLinkAggregator from "./static/ChainLinkAggregator.json";
import ERC20ABI from "./static/ERC20ABI.json";
import ERC20LiquidityPool from "./static/ERC20LiquidityPool.json";
import ERC20Options from "./static/ERC20Options.json";
import WriterPool from "./static/WriterPool.json";

import babelPolyfill from "babel-polyfill";

export default {
  name: "App",
  mounted: function() {
    const ETH_NETWORK = process.env.VUE_APP_ETH_NETWORK;
    const netVersion = window.ethereum.networkVersion;

console.log("netVersion:",netVersion)
    switch (netVersion) {
      case "5777": {
        //dev
        store.addresses = Addresses.development;
        store.networkIsSupported = true;
        break;
      }
      case "4": {
        //rinkeby
        store.addresses = Addresses.rinkeby;
        store.networkIsSupported = true;
        break;
      }
      case "1": {
        //mainnet
        store.addresses = Addresses.mainnet;
        store.networkIsSupported = false;
        break;
      }
      case "56": {
        //Binance Smart Chain Mainnet
        store.addresses = Addresses.binanceMainnet;
        store.networkIsSupported = false;
        break;
      }
      case "97": {
        //Binance Smart Chain Testnet
        store.addresses = Addresses.binanceTestnet;
        store.networkIsSupported = true;
        break;
      }
      case "137": {
        //Matic/Polygon Smart Chain Mainnet
        store.addresses = Addresses.polygonMainnet;
        store.networkIsSupported = true;
        break;
      }
      case "80001": {
        //Matic/Polygon Smart Chain Testnet
        store.addresses = Addresses.polygonTestnet;
        store.networkIsSupported = true;
        break;
      }   
     case "1287": {
        //Moonbeam Testnet
        store.addresses = Addresses.moonbeamTestnet;
        store.networkIsSupported = true;
        break;
      }      
      default: {
        //network not supported
        store.networkIsSupported = false;
      }
    }

    store.abis = [];
    store.abis.ChainLinkAggregator = ChainLinkAggregator.abi;
    store.abis.ERC20 = ERC20ABI;
    store.abis.ERC20LiquidityPool = ERC20LiquidityPool.abi;
    store.abis.ERC20Options = ERC20Options.abi;
    store.abis.WriterPool = WriterPool.abi;
  },
};
</script>

<style lang="scss">
// Import Main styles for this application
@import "assets/scss/style";
</style>
