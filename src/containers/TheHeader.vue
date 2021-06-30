<template>
  <CHeader fixed with-subheader light>
    <CToggler
      in-header
      class="ml-3 d-lg-none"
      @click="$store.commit('toggleSidebarMobile')"
    />
    <CToggler
      in-header
      class="ml-3 d-md-down-none"
      @click="$store.commit('toggleSidebarDesktop')"
    />
    <CHeaderBrand class="mx-auto logo" href="https://optyn.co">
      <CIcon name="logo" height="48" alt="Logo" src="optyn-logo-45x45.png" />
    </CHeaderBrand>
    <CHeaderNav class="mr-4 connect">
      <button @click="connect">
        {{
          userWeb3Connected
            ? "Disconnect : " + account.toString().slice(0, 7) + "..."
            : "Connect Wallet"
        }}
      </button>
    </CHeaderNav>
  </CHeader>
</template>

<script>
import Web3 from "web3";
import Web3Connect from "web3connect";
import WalletConnectProvider from "@walletconnect/web3-provider";
import HDWalletProvider from "@truffle/hdwallet-provider";

const infuraId = "936de429817143ed994d266ab90ca264";

import { EventBus } from "../api/EventBus";
import { store } from "../api/Store";

export default {
  name: "TheHeader",
  components: {},
  data() {
    return {
      // web3: null,
      // infuraWeb3: null,
      // infuraWeb3Connected: false,
      account: null,
      // userWeb3: null,
      userWeb3Connected: false,
      web3Connect: new Web3Connect.Core({
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: { infuraId },
          },
        },
      }),
      provider: null,
    };
  },
  methods: {
    connect() {
      store.connectUser();
    },
  },
  mounted() {
    EventBus.$on("userWeb3Connected", () => {
      this.account = store.userAccount;
      this.userWeb3Connected = store.userWeb3Connected;
    });

    EventBus.$on("userWeb3Disconnected", () => {
      this.account = store.userAccount;
      this.userWeb3Connected = store.userWeb3Connected;
    });
  },
};
</script>
<style scoped>
.logo {
  padding: 2px 0 2px 80px;
}
</style>
