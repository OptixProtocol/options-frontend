<script>
import { EventBus } from "../../api/EventBus";
import { store } from "../../api/Store";
import ERC20API from "../../api/ERC20";
import LiquidityPoolAPI from "../../api/LiquidityPool";
import ERC20OptionsAPI from "../../api/ERC20Options";
import Web3 from "web3";
import { Money } from "v-money";
import MyOptions from "./MyOptions.vue";
// import HDWalletProvider from "@truffle/hdwallet-provider";

const toBN = Web3.utils.toBN;
const gweiToCents = (x) => toBN(x).div(toBN(1e7));
// const centsToGwei = (x) => toBN(x * 100).mul(toBN(1e6));
const centsToGwei = (x) => x * 1e9;
const gweiToWei = (x) => toBN(x).mul(toBN(1e9));
const gweiToEth = (x) => toBN(x).div(toBN(1e7));
// const weiToEth = (x) => toBN(x).mul(toBN(1e9));

export default {
  name: "TradeOptions",
  components: {
    Money,
    MyOptions,
  },
  data() {
    return {
      tokenSymbols: [],
      latestPrice: 0,
      strikePrice: 0,
      userBalance: 0,
      allowance: 0,
      optionSize: 1,
      // optionValue: 1000,
      sentiment: "short",
      money: {
        decimal: ".",
        thousands: ",",
        prefix: "$",
        suffix: " (USD)",
        precision: 2,
        masked: false,
      },
      moneyUSD: {
        decimal: ".",
        thousands: ",",
        prefix: "$",
        suffix: " (USD)",
        precision: 2,
        masked: false,
      },
      moneyGwei: {
        decimal: ".",
        thousands: "",
        prefix: "",
        suffix: " (Gwei)",
        precision: 2,
        masked: false,
      },
      periodSelected: 86400,
      periodOptions: [
        { value: "86400", text: "1 day" },
        { value: "604800", text: "7 days (1 week)" },
        { value: "1209600", text: "14 days (2 weeks)" },
        { value: "1814400", text: "21 days (3 weeks)" },
        { value: "2419200", text: "28 days (4 weeks)" },
      ],
      selectedMarketId: 0,
      availableLiquidity: 0,
      protocolFee: 0,
      strikeFee: 0,
      periodFee: 0,
      balanceFee: 0,
      lpFee: 0,
      totalFee: 0,
      totalPremium: 0,
      totalBalance: 0,
      lockedAmount: 0,
      buyButtonVariant: "secondary",
      buyButtonText: "Connect Wallet",
      userWeb3Connected: false,
      approveVariant: "",
      provideVariant: "",
      formIsValid: false,
      formIsValidText: "",
      toggleFontSize: 16,
      toggleWidth: 120,
      toggleHeight: 30,
    };
  },
  computed: {
    optionValue: {
      get() {
        return this.optionSize * this.displayStrikePrice;
      },

      set(val) {
        this.optionSize = val / this.displayStrikePrice;
      },
    },
    displayStrikePrice: {
      get() {
        return this.strikePrice ;
      },
      set(val) {
        this.strikePrice = val ;
      },
    },
    displayTotal: {
      get() {
        return (this.totalPremium / 1e18).toFixed(5);
      },
    },
    displayTotalUSD: {
      get() {
        return (gweiToCents(this.latestPrice) /100 * this.displayTotal).toFixed(
          2
        );
      },
    },
    displayCollateralToken: {
      get() {
        if (this.tokenSymbols[this.selectedMarketId] != null)
          return this.tokenSymbols[this.selectedMarketId].collateral;
      },
    },

    displayBreakeven: {
      get() {
        if (this.sentiment == "long") {
          //strikePrice + (totalUSD/optionSize)
          return (
            this.strikePrice  +
            this.displayTotalUSD / this.optionSize
          ).toFixed(2);
        } else {
          //strikePrice - (totalUSD/optionSize)
          return (
            this.strikePrice  -
            this.displayTotalUSD / this.optionSize
          ).toFixed(2);
        }
      },
    },
    displayValue: {
      get() {
        return (
          this.money.prefix +
          (gweiToCents(this.latestPrice)/100 * this.optionSize).toFixed(2) +
          " " +
          this.money.suffix
        );
      },
    },
    displayUserBalance: {
      get() {
        return (this.userBalance / 1e18).toFixed(5);
      },
    },
    displayProtocolFee: {
      get() {
        return (this.protocolFee / 100).toFixed(2);
      },
    },
    displayStrikeFee: {
      get() {
        return (this.strikeFee / 100).toFixed(2);
      },
    },
    displayPeriodFee: {
      get() {
        return (this.periodFee / 100).toFixed(2);
      },
    },
    displayBalanceFee: {
      get() {
        return (this.balanceFee / 100).toFixed(2);
      },
    },
    displayLPFee: {
      get() {
        return (this.lpFee / 100).toFixed(2);
      },
    },
    displayTotalFee: {
      get() {
        return (this.totalFee / 100).toFixed(2);
      },
    },

    displayLeverage: {
      get() {
        return (this.optionValue / this.displayTotalUSD).toFixed(0);
      },
    },
    displayApproveVariant: {
      get(){
        if (this.allowance >= this.totalPremium) {
         return "secondary";
        } else {
          return "success";
        }
      }
    },
    displayProvideVariant: {
      get(){
        if (this.allowance >= this.totalPremium) {
          return "success";
        } else {    
          return "secondary";
        }
      }
    }

  },
  methods: {
    async getAllowance() {
      this.allowance = await ERC20API.getAllowanceERC20Options();
      this.updateFormIsValid();
    },
    async getMarketDescriptions() {
      this.tokenSymbols = await LiquidityPoolAPI.getMarketList();
    },
    async getLatestPrice() {
      this.latestPrice = await ERC20OptionsAPI.getLatestPrice();
      this.tokenSymbols = await LiquidityPoolAPI.getMarketList();

      let pair2 = this.tokenSymbols[this.selectedMarketId].pair2;
      let sp = 0;
      switch (pair2) {
        case "USD":
          sp = gweiToCents(this.latestPrice);
          this.money = this.moneyUSD;
          break;
        case "Gwei":
          sp = gweiToEth(this.latestPrice);
          this.money = this.moneyGwei;
          break;
      }
      this.strikePrice = sp.toString();
    },
    connectUser: function(event) {
      store.connectUser();
    },
    changeOptionType(action) {
      if (action.value) {
        this.sentiment = "short";
      } else {
        this.sentiment = "long";
      }
      this.getFees();
      this.updateFormIsValid();
    },
    changeOptionSize() {
      
      this.getFees();
      this.updateFormIsValid();
    },
    changeOptionValue() {
      this.getFees();
    },
    changeStrikePrice() {
      this.getFees();
    },
    async changeSelected() {
      await store.setSelectedMarketId(this.selectedMarketId);

      this.getLatestPrice();
      this.getUserBalance();
      this.getPoolBalance();
      this.getAllowance();
      this.getFees();
      this.updateFormIsValid();
    },
    changePeriodOfHolding(value) {
      this.periodOfHolding.text = value;
    },
    changePeriodOfHolding() {
      this.getFees();
    },

    getOptionSize() {
      return centsToGwei(this.optionSize);
    },
    getPeriod() {
      return toBN(this.periodSelected);
    },
    getStrikePrice() {
      return this.strikePrice;
    },
    getOptionType() {
      return this.sentiment == "long"
        ? ERC20OptionsAPI.OptionType.Call
        : ERC20OptionsAPI.OptionType.Put;
    },
    updateFormIsValid() {
      if (!this.userWeb3Connected) {
        this.formIsValid = false;
        return;
      } else {
        if (this.userBalance == 0) {
          this.formIsValid = false;
          this.formIsValidText = "Not enough balance";
          return;
        }

        if (this.optionSize == 0) {
          this.formIsValid = false;
          this.formIsValidText = "Increase size";
          return;
        }

        // console.log("optionSize:",this.getOptionSize()*1e9);
        // console.log("poolBalance:",this.poolBalance);
        if (+(this.getOptionSize()*1e9) > +this.poolBalance){
          this.formIsValid = false;
          this.formIsValidText = "Pool capacity reached";
          return;
        }

        this.formIsValid = true;
      }
    },
    async getUserBalance() {
      this.userBalance = await ERC20API.getUserBalance();
    },
    async getPoolBalance() {
      this.poolBalance = await LiquidityPoolAPI.getAvailableBalance();
      this.availableLiquidity = (
        toBN(this.poolBalance).div(toBN(1e18))
      ).toString();
    },
    async getFees() {
      let _period = this.getPeriod();
      let _optionSize = this.getOptionSize();
      let _strikePrice = (centsToGwei(this.getStrikePrice())/10).toFixed(0);
      let _optionType = this.getOptionType();
      // console.log("_period:", _period.toString());
      // console.log("_optionSize:", _optionSize.toString());
      // console.log("_strikePrice:", _strikePrice.toString());
      // console.log("_optionType:", _optionType.toString());
      // console.log("_latestPrice:", this.latestPrice);
      let fees = await ERC20OptionsAPI.getFees(
        _period,
        _optionSize,
        _strikePrice,
        _optionType
      );
      // console.log("fees:", fees);
      this.periodFee = fees.periodFee;
      this.strikeFee = fees.strikeFee;
      this.totalFee = fees.total;

      let premium = await ERC20OptionsAPI.getPremium(
        _period,
        _optionSize,
        _strikePrice,
        _optionType
      );
      this.totalPremium = premium.total;

      // console.log("premium:", premium);
      this.protocolFee = fees.protocolFee;
      this.strikeFee = fees.strikeFee;
      this.periodFee = fees.periodFee;
      this.balanceFee = fees.balanceFee;
      this.lpFee = fees.lpFee;
    },
    async setApprove() {
      await ERC20API.setApproveERC20Options(this.totalPremium);
      // this.updateButtonVariant();
    },
    async setBuy() {
      if (store.userWeb3Connected) {
        let _period = this.getPeriod();
        let _optionSize = this.getOptionSize();
        let _strikePrice = (centsToGwei(this.getStrikePrice())/10).toFixed(0);
        let _optionType = this.getOptionType();
        let _optionId = await ERC20OptionsAPI.setBuy(
          _period,
          _optionSize,
          _strikePrice,
          _optionType
        );
        // console.log("optionId:", _optionId);
      } else {
        await store.connectUser();
      }
    },
  },
  mounted() {
    if (store.userWeb3Connected){
      this.userWeb3Connected = store.userWeb3Connected;
      store.setSelectedMarketId(this.selectedMarketId).then( () => { 
        this.getMarketDescriptions();
        this.getLatestPrice();
        this.getUserBalance();
        this.getPoolBalance();
        this.getAllowance();
        this.getFees();
        this.updateFormIsValid();
      });
    }
    EventBus.$on("userWeb3Connected", () => {
      this.userWeb3Connected = store.userWeb3Connected;
      store.setSelectedMarketId(this.selectedMarketId).then( () => { 
        this.getMarketDescriptions();
        this.getLatestPrice();
        this.getPoolBalance();
        this.getUserBalance();
        this.getAllowance();
        this.getFees();
        this.updateFormIsValid();
      });
    });
    EventBus.$on("userWeb3Disconnected", () => {
      this.userWeb3Connected = store.userWeb3Connected;
      this.balance = 0;
      this.allowance = 0;
      this.getFees();
      this.updateFormIsValid();
    });
    EventBus.$on("ERC20:setApproveERC20Options:receipt", () => {

      this.getAllowance();
      this.updateFormIsValid();
    });
    EventBus.$on("ERC20Options:create:receipt", () => {
      this.getUserBalance();
      this.getPoolBalance();
      this.getAllowance();
      this.getFees();
    });
  },
};
</script>

<style>
.rounded-card {
  border-radius: 25px;
}
.card_title {
  font-weight: 500;
  font-size: 25px;
}

.v-money {
  width: 320px;
  height: 40px;
  padding-left: 12px;
  color: #3c4b64;
  border: 1px solid #ced4da;
}

.balance {
  font-size: 12px;
  padding-top: 15px;
  color: #a7a6a6;
}

.value {
  font-size: 12px;
  margin-top: -15px;
  color: #a7a6a6;
}

.fees {
  font-size: 10px;
}
</style>

<template>
  <CRow>
    <CCol md="12">
      <b-card
        tag="article"
        style="max-width: 25rem;"
        class="mb-2 rounded-card mx-auto"
      >
        <template #header class="mx-auto">
          <h6 class="mb-0 text-center card_title">Trade Options</h6>
        </template>
        <b-card-body>
          <b-card-text>
            <b-form-group
              id="input-group-2"
              label="Option Type"
              label-for="input-2"
            >
              <b-input-group>
                <b-col cols="6">
                  <toggle-button
                    id="toggleSentiment"
                    :value="true"
                    :labels="{
                      checked: 'Short (Put)',
                      unchecked: 'Long (Call)',
                    }"
                    :color="{
                      checked: '#007bff',
                      unchecked: '#007bff',
                      disabled: '#CCCCCC',
                    }"
                    :font-size="toggleFontSize"
                    :width="toggleWidth"
                    :height="toggleHeight"
                    @change="changeOptionType"
                  />
                </b-col>
              </b-input-group>
            </b-form-group>

            <b-row>
              <b-col cols="6">Option Size</b-col>
              <b-col cols="6" class="text-right balance">
                Balance:
                {{ displayUserBalance }}
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="12">
                <b-form-group id="input-group-2" label="" label-for="input-2">
                  <b-input-group>
                    <template #append>
                      <b-form-select
                        style="width:100%"
                        v-model="selectedMarketId"
                        :options="tokenSymbols"
                        @change="changeSelected"
                      ></b-form-select>
                    </template>
                    <b-form-input
                      v-model="optionSize"
                      id="optionSizeInput"
                      required
                      type="number"
                      class="optionSize"
                      @change="changeOptionSize"
                    ></b-form-input>
                  </b-input-group>
                </b-form-group> </b-col
            ></b-row>
            <b-row>
              <b-col class="text-left value">
                Value:
                {{ displayValue }}
              </b-col>
            </b-row>
            <b-form-group
              id="input-group-2"
              label="Strike Price"
              label-for="input-2"
              class="mt-3"
            >
              <money
                block
                v-model="displayStrikePrice"
                v-bind="money"
                @change.native="changeStrikePrice"
              ></money>
            </b-form-group>
            <b-form-group
              id="input-group-2"
              label="Period of Holding"
              label-for="input-2"
              class="form_title "
            >
              <b-form-select
                id="periodOfHolding"
                v-model="periodSelected"
                :options="periodOptions"
                @change="changePeriodOfHolding"
              ></b-form-select>
            </b-form-group>
            <b-row>
              <b-col cols="6">Leverage</b-col>
              <b-col cols="6" class="text-right">
                {{ displayLeverage }}x
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="6">
                Breakeven
              </b-col>
              <b-col cols="6" class="text-right">
                ${{ displayBreakeven }}
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="6">
                Total USD
              </b-col>
              <b-col cols="6" class="text-right">
                ${{ displayTotalUSD }}
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="6"> Total {{ displayCollateralToken }} </b-col>
              <b-col cols="6" class="text-right">
                {{ displayTotal }}
              </b-col>
            </b-row>
            <b-row v-if="!userWeb3Connected">
              <b-col md="12">
                <b-button block variant="secondary" @click="connectUser">
                  Connect Wallet
                </b-button>
              </b-col>
            </b-row>
            <b-row v-if="!formIsValid && userWeb3Connected">
              <b-col md="12">
                <b-button block variant="secondary">
                  {{ this.formIsValidText }}
                </b-button>
              </b-col>
            </b-row>
            <b-row v-if="formIsValid" class="mt-2">
              <b-col md="6" class="d-flex justify-content-center">
                <b-button block :variant="displayApproveVariant" @click="setApprove"
                  >Approve {{ displayCollateralToken }}</b-button
                >
              </b-col>
              <b-col md="6" class="d-flex justify-content-center">
                <b-button block :variant="displayProvideVariant" @click="setBuy"
                  >Buy</b-button
                >
              </b-col>
            </b-row>
            <b-row class="fees mt-4">
              <b-col cols="8">
                Available Liquidity
              </b-col>
              <b-col cols="4" class="text-right">
                {{ availableLiquidity + " " + displayCollateralToken }}
              </b-col>
            </b-row>
            <b-row class="fees">
              <b-col cols="8">
                Protocol Fee
              </b-col>
              <b-col cols="4" class="text-right">
                {{ displayProtocolFee }}%
              </b-col>
            </b-row>
            <b-row class="fees">
              <b-col cols="8">
                Strike Fee
              </b-col>
              <b-col cols="4" class="text-right">
                {{ displayStrikeFee }}%
              </b-col>
            </b-row>
            <b-row class="fees">
              <b-col cols="8">
                Period Fee
              </b-col>
              <b-col cols="4" class="text-right">
                {{ displayPeriodFee }}%
              </b-col>
            </b-row>
            <b-row class="fees">
              <b-col cols="8">
                Balance Fee
              </b-col>
              <b-col cols="4" class="text-right">
                {{ displayBalanceFee }}%
              </b-col>
            </b-row>
            <b-row class="fees">
              <b-col cols="8">
                Liquidity Provider Fee
              </b-col>
              <b-col cols="4" class="text-right"> {{ displayLPFee }}% </b-col>
            </b-row>
            <b-row class="fees">
              <b-col cols="8">
                Total Fee
              </b-col>
              <b-col cols="4" class="text-right">
                {{ displayTotalFee }}%
              </b-col>
            </b-row>
          </b-card-text>
        </b-card-body>
      </b-card>

      <MyOptions></MyOptions>
    </CCol>
  </CRow>
</template>
