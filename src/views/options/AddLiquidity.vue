<script>
import { EventBus } from "../../api/EventBus";
import { store } from "../../api/Store";
import Web3 from "web3";
import LiquidityPoolAPI from "../../api/LiquidityPool";
import ERC20API from "../../api/ERC20";
import ERC20OptionsAPI from "../../api/ERC20Options";

const toBN = Web3.utils.toBN;
const gweiToEth = (x) => toBN(x).div(toBN(1e9));
const ethToGwei = (x) => toBN(x).mul(toBN(1e9));
const ethToWei = (x) => toBN(1e18 * x);
const gweiToWei = (x) => toBN(x).mul(toBN(1e9));

export default {
  name: "AddLiquidity",
  components: {},
  data() {
    return {
      selectedToken: null,
      selectedPoolId: "0",
      selectedPoolSymbol: "XXX",
      userWeb3Connected: false,
      allowance: 0,
      amount: "0",
      protocolFee: 0,
      userBalance: 0,
      poolBalance: 0,
      tokenPoolList: [],
      totalSupply: 0,
      lockedAmount: 0,
      lockedPremium: 0,
      lockedLiquidity: 0,
      totalBalance: 0,
      availableBalance: 0,
      shareOf: 0,
      writerBalanceOf: 0,
      poolSharePercent: 0,
      approveVariant: "",
      provideVariant: "",
      withdrawVariant: "",
      addWithdrawSelected: "add",
      lockedUntil: null,
      lastProvideTimestamp: 0,
      lockupPeriod: 0,
      addWithdrawOptions: [
        { value: "add", text: "Add Liquidity" },
        { value: "withdraw", text: "Withdraw Liquidity" },
      ],
    };
  },
  computed: {
    lockedForTime: {
      get() {
        // var d = new Date(this.lockupPeriod * 1000);
        // return d;
        return this.timeDiffCalc(
          Date.now(),
          Date.now() + this.lockupPeriod * 1000
        );
      },
    },
  },
  methods: {
    async getProtocolFee() {
      this.protocolFee = await ERC20OptionsAPI.getProtocolFee();
    },
    async getUserBalance() {
      this.userBalance = await ERC20API.getUserBalance(store.userAccount);
    },
    async getPoolBalance() {
      this.poolBalance = await ERC20API.getPoolBalance();
    },
    async getAllowance() {
      this.allowance = await ERC20API.getAllowanceLiqudityPool(
        store.userAccount
      );
      console.log("allowance:", this.allowance);
    },
    async getTokenPoolList() {
      this.tokenPoolList = await LiquidityPoolAPI.getTokenPoolList();
      this.selectedPoolId = store.selectedPoolId;
      this.selectedPoolSymbol = this.tokenPoolList[this.selectedPoolId].text;
    },
    getApproved() {},

    async setApprove() {
      await ERC20API.setApproveLiqudityPool(
        ethToWei(this.amount),
        this.selectedPoolId
      );
      await this.getAllowance();
      this.updateButtonVariant();
    },
    async setProvide() {
      await LiquidityPoolAPI.setProvide(ethToWei(this.amount));
    },
    async setApproveWriterPool() {
      await LiquidityPoolAPI.setApproveWriterPool();
    },

    async setWithdraw() {
      await LiquidityPoolAPI.setWithdraw(ethToWei(this.amount));
    },
    async getPoolStats() {
      var totalSupply = await LiquidityPoolAPI.getTotalSupply();
      var lockedAmount = await LiquidityPoolAPI.getLockedAmount();
      var lockedPremium = await LiquidityPoolAPI.getLockedPremium();
      var totalBalance = await LiquidityPoolAPI.getTotalBalance();
      var availableBalance = await LiquidityPoolAPI.getAvailableBalance();
      this.lockupPeriod = await LiquidityPoolAPI.getLockupPeriod();

      if (store.userAccount != null) {
        var writerBalanceOf = await LiquidityPoolAPI.getWriterBalanceOf();
        this.writerBalanceOf = writerBalanceOf;
        var shareOf = await LiquidityPoolAPI.getShareOf();
        this.shareOf = shareOf;

        this.lastProvideTimestamp = await LiquidityPoolAPI.getLastProvideTimestamp();

        console.log("lastProvideTimestamp:", lastProvideTimestamp);
        console.log("lockupPeriod:", lockupPeriod);

        var d = new Date((+lastProvideTimestamp + +lockupPeriod) * 1000);
        this.lockedUntil = d.toLocaleString();
      }

      this.totalSupply = totalSupply;
      this.lockedAmount = lockedAmount;
      this.lockedPremium = lockedPremium;
      this.totalBalance = totalBalance;
      this.availableBalance = availableBalance;
      this.poolSharePercent = (this.shareOf / this.totalBalance) * 100;

      // this.lockedLiquidity = await LiquidityPoolAPI.getLockedLiquidity(
      //   this.tokenPoolContracts[this.selectedPoolId]._address
      // );
    },
    connectUser: function(event) {
      store.connectUser();
    },

    deposit: function(event) {},

    changeAmount() {
      //  this.getFees();
      this.updateButtonVariant();
    },
    async changeSelected() {
      await store.setSelectedPoolId(this.selectedPoolId);
      this.selectedPoolSymbol = store.tokenPoolList[this.selectedPoolId].text;
      this.getUserBalance();
      this.getPoolBalance();
      this.getAllowance();
      this.getPoolStats();
    },
    changeAddWithdraw() {
      // console.log(this.addWithdrawSelected);
    },
    updateButtonVariant() {
      if (this.addWithdrawSelected == "add") {
        if (this.amount == 0) {
          this.approveVariant = "secondary";
          this.provideVariant = "secondary";
          return;
        }

        console.log("amount:", this.amount);
        if (this.allowance >= ethToWei(this.amount)) {
          this.approveVariant = "secondary";
          this.provideVariant = "success";
        } else {
          this.approveVariant = "success";
          this.provideVariant = "secondary";
        }
      } else {
        if (this.amount > this.shareOf / 1e31) {
          this.withdrawVariant = "secondary";
        } else {
          this.withdrawVariant = "success";
        }
      }
    },
    timeDiffCalc(dateFuture, dateNow) {
      let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

      // calculate days
      const days = Math.floor(diffInMilliSeconds / 86400);
      diffInMilliSeconds -= days * 86400;

      // calculate hours
      const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
      diffInMilliSeconds -= hours * 3600;

      // calculate minutes
      const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
      diffInMilliSeconds -= minutes * 60;

      let difference = "";
      if (days > 0) {
        difference += days === 1 ? `${days} day` : `${days} days`;
      }

      // difference +=
      //   hours === 0 || hours === 1 ? `${hours} hour, ` : `${hours} hours, `;

      // difference +=
      //   minutes === 0 || hours === 1
      //     ? `${minutes} minutes`
      //     : `${minutes} minutes`;

      return difference;
    },
  },
  mounted() {
    // store.initInfura();
    this.userWeb3Connected = store.userWeb3Connected;
    if (store.userWeb3Connected){
      store.setSelectedPoolId(this.selectedPoolId);
      this.getTokenPoolList();
      this.getUserBalance();
      this.getPoolStats();
      this.getAllowance();
      this.updateButtonVariant();
    }


    EventBus.$on("userWeb3Connected", () => {
      this.userWeb3Connected = store.userWeb3Connected;
      store.setSelectedPoolId(this.selectedPoolId);
      this.getTokenPoolList();
      this.getUserBalance();
      this.getPoolStats();
      this.getAllowance();
      this.updateButtonVariant();
    });

    EventBus.$on("userWeb3Disconnected", () => {
      this.userWeb3Connected = store.userWeb3Connected;
      this.userBalance = 0;
      this.allowance = 0;
      this.updateButtonVariant();
    });

    EventBus.$on("store:initInfura", () => {
      store.setSelectedPoolId(this.selectedPoolId);
      this.getTokenPoolList();
      this.getPoolStats();
      this.getPoolBalance();
      this.getProtocolFee();

      if (store.userWeb3Connected) {
        this.userWeb3Connected = store.userWeb3Connected;
        this.getUserBalance();
        this.getPoolStats();
        this.getAllowance();
        this.updateButtonVariant();
      }
    });

    EventBus.$on("setProvide:receipt", () => {
      this.getUserBalance();
      this.getAllowance();
      this.updateButtonVariant();
      this.getPoolStats();
    });

    EventBus.$on("setWithdraw:receipt", () => {
      this.getUserBalance();
      this.getAllowance();
      this.updateButtonVariant();
      this.getPoolStats();
    });
  },
};
</script>

<style scoped>
.rounded-card {
  border-radius: 25px;
}
.card_title {
  font-weight: 500;
  font-size: 25px;
}
.balance {
  font-size: 12px;
  color: #a7a6a6;
}
.amount {
  width: 152px;
}
.poolInfo {
  font-size: 10px;
}
</style>

<template>
  <b-row>
    <b-col md="12">
      <b-card
        tag="article"
        style="max-width: 25rem;"
        class="mb-2 rounded-card mx-auto "
      >
        <template #header>
          <h6 class="mb-0 text-center card_title">Liquidity Pool</h6>
        </template>
        <b-card-body>
          <b-card-text>
            <b-row class="mb-4">
              <b-col cols="12">
                <b-form-select
                  id="addWithdraw"
                  v-model="addWithdrawSelected"
                  :options="addWithdrawOptions"
                  @change="changeAddWithdraw"
                ></b-form-select>
              </b-col>
            </b-row>
            <div v-if="addWithdrawSelected == 'add'">
              <b-row>
                Deposit
              </b-row>
              <b-row>
                <b-col cols="2"> </b-col>
                <b-col cols="10" class="text-right balance">
                  Balance:
                  {{ (userBalance / 1e18).toFixed(5) }}
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="12">
                  <b-form-group id="input-group-2" label-for="input-2">
                    <b-input-group>
                      <template #append>
                        <b-form-select
                          v-model="selectedPoolId"
                          :options="tokenPoolList"
                          @change="changeSelected"
                        ></b-form-select>
                      </template>
                      <b-form-input
                        v-model="amount"
                        id="amountInput"
                        placeholder="1"
                        required
                        type="number"
                        class="amount"
                        @change="changeAmount"
                      ></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-row>
                Pool Share
              </b-row>

              <b-row class="poolInfo mt-1">
                <b-col cols="8">
                  Current Pool Size
                </b-col>
                <b-col cols="4" class="text-right">
                  {{ (poolBalance / 1e18).toFixed(5) }}
                  {{ selectedPoolSymbol }}
                </b-col>
              </b-row>
              <b-row v-if="userWeb3Connected" class="poolInfo mt-1">
                <b-col cols="8">
                  Your Pool Share ({{ poolSharePercent.toFixed(2) }}%)
                </b-col>
                <b-col cols="4" class="text-right">
                  {{ (shareOf / 1e18).toFixed(5) }}
                  {{ selectedPoolSymbol }}
                </b-col>
              </b-row>
              <b-row v-if="!userWeb3Connected" class="mt-3">
                <b-col md="12">
                  <b-button block variant="secondary" @click="connectUser">
                    Connect Wallet
                  </b-button>
                </b-col>
              </b-row>
              <b-row
                v-if="userWeb3Connected && (amount == 0 || userBalance == 0)"
              >
                <b-col md="12">
                  <b-button block variant="secondary">
                    {{ amount == 0 ? "Enter Amount" : "No balance" }}
                  </b-button>
                </b-col>
              </b-row>
              <b-row v-if="userWeb3Connected && amount > 0 && userBalance > 0">
                <b-col md="6" class="d-flex justify-content-center">
                  <b-button block :variant="approveVariant" @click="setApprove"
                    >Approve
                    {{ this.tokenPoolList[this.selectedPoolId].text }}</b-button
                  >
                </b-col>
                <b-col md="6" class="d-flex justify-content-center">
                  <b-button block :variant="provideVariant" @click="setProvide"
                    >Supply</b-button
                  >
                </b-col>
              </b-row>

              <b-row>
                <hr />
                ⭐️ By adding liquidity you'll earn the fees of all options
                traded (less the protocol fee of {{ this.protocolFee / 100 }}%)
                where this pool is used for collateral, proportional to your
                share of the pool <Br /> ⭐️ Fees are added added to the pool,
                are unlocked when options expire and can be claimed by
                withdrawing your liquidity <Br />
                ⭐️ Liquidity you add now will be locked for
                {{ lockedForTime }}
              </b-row>
            </div>
            <div v-if="addWithdrawSelected == 'withdraw'">
              <b-row>
                <b-col cols="2"> </b-col>
                <b-col cols="10" class="text-right balance">
                  Balance:
                  {{ (userBalance / 1e18).toFixed(5) }}
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="12">
                  <b-form-group id="input-group-2" label-for="input-2">
                    <b-input-group>
                      <template #append>
                        <b-form-select
                          v-model="selectedPoolId"
                          :options="tokenPoolList"
                          @change="changeSelected"
                        ></b-form-select>
                      </template>
                      <b-form-input
                        v-model="amount"
                        id="amountInput"
                        placeholder="1"
                        required
                        type="number"
                        class="amount"
                        @change="changeAmount"
                      ></b-form-input>
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                Pool Share
              </b-row>
              <b-row class="poolInfo mt-1">
                <b-col cols="6">
                  Current Pool Size
                </b-col>
                <b-col cols="6" class="text-right">
                  {{ (poolBalance / 1e18).toFixed(5) }}
                  {{ selectedPoolSymbol }}
                </b-col>
              </b-row>
              <b-row v-if="userWeb3Connected" class="poolInfo mt-1 mb-2">
                <b-col cols="6">
                  Your Pool Share ({{ poolSharePercent.toFixed(2) }}%)
                </b-col>
                <b-col cols="6" class="text-right">
                  {{ (shareOf / 1e18).toFixed(5) }}
                  {{ selectedPoolSymbol }}
                </b-col>
              </b-row>
              <b-row
                v-if="userWeb3Connected && lastProvideTimestamp > 0"
                class="poolInfo mt-1 mb-2"
              >
                <b-col cols="6">
                  Locked until
                </b-col>
                <b-col cols="6" class="text-right">
                  {{ lockedUntil }}
                </b-col>
              </b-row>

              <b-row v-if="!userWeb3Connected" class="mt-3">
                <b-col md="12">
                  <b-button block variant="secondary" @click="connectUser">
                    Connect Wallet
                  </b-button>
                </b-col>
              </b-row>
              <b-row v-if="userWeb3Connected && (amount == 0 || shareOf == 0)">
                <b-col md="12">
                  <b-button block variant="secondary">
                    {{ amount == 0 ? "Enter Amount" : "No balance" }}
                  </b-button>
                </b-col>
              </b-row>
              <b-row v-if="userWeb3Connected && amount > 0 && shareOf > 0">
                <b-col md="6" class="d-flex justify-content-center">
                  <b-button
                    block
                    :variant="approveVariant"
                    @click="setApproveWriterPool"
                    >Approve
                    {{ this.tokenPoolList[this.selectedPoolId].text }}</b-button
                  >
                </b-col>
                <b-col md="6" class="d-flex justify-content-center">
                  <b-button
                    block
                    :variant="withdrawVariant"
                    @click="setWithdraw"
                    >Withdraw</b-button
                  >
                </b-col>
              </b-row>
            </div>
          </b-card-text>
        </b-card-body>
      </b-card>

      <CCard v-if="false">
        <CCardHeader>
          Pool Stats
        </CCardHeader>
        <CCardBody>
          <b-row
            ><b-col cols="3">Total Supply</b-col
            ><b-col cols="3">{{ totalSupply }}</b-col></b-row
          >
          <b-row
            ><b-col cols="3">Locked Amount</b-col
            ><b-col cols="3">{{ lockedAmount }}</b-col></b-row
          >
          <b-row
            ><b-col cols="3">Locked Premium</b-col
            ><b-col cols="3">{{ lockedPremium }}</b-col></b-row
          >
          <b-row
            ><b-col cols="3">Total Balance</b-col
            ><b-col cols="3">{{ totalBalance }}</b-col></b-row
          >
          <b-row
            ><b-col cols="3">Available Balance</b-col
            ><b-col cols="3">{{ availableBalance }}</b-col></b-row
          >
          <b-row
            ><b-col cols="3">Writer Balance Of</b-col
            ><b-col cols="3">{{ writerBalanceOf }}</b-col></b-row
          >
          <b-row
            ><b-col cols="3">Share Of</b-col
            ><b-col cols="3">{{ shareOf }}</b-col></b-row
          >
          <!-- <b-row
            ><b-col cols="3">Locked Liquidity</b-col
            ><b-col cols="3">{{ lockedLiquidity }}</b-col></b-row
          > -->
        </CCardBody>
      </CCard>

      <CCard  v-if="false">
        <CCardHeader>
          Your Earnings
        </CCardHeader>
        <CCardBody> </CCardBody>
      </CCard>
    </b-col>
  </b-row>
</template>
