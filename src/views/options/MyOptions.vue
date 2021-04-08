<script>
import { EventBus } from "../../api/EventBus";
import ERC20OptionsAPI from "../../api/ERC20Options";
import LiquidityPoolAPI from "../../api/LiquidityPool";
import { ethers } from "ethers";
import { store } from "../../api/Store";

const toBN = ethers.BigNumber.from;
// BigNumber.config({ EXPONENTIAL_AT: 1e18 });
const gweiToCents = (x) => toBN(x).div(toBN(1e10));
const gweiToEth = (x) => toBN(x).div(toBN(1e9));
const oracleToCents = (x) => x / 100000000;
const centsToGwei = (x) => x * 1e9;

// //option type
// const Short = 1;
// const Long = 2;

// //option status
// const Inactive = 0;
// const Active = 1;
// const Exercised = 2;
// const Expired = 3;

export default {
  data() {
    return {
      showActive: true,
      toggleFontSize: 16,
      toggleWidth: 100,
      toggleHeight: 30,
      tableItems: [],
      tableItemsActive: [],
      tableItemsExpired: [],
      item: null,
      tableFields: [
        { key: "type" },
        { key: "market" },
        { key: "strikePrice", label: "Strike" },
        { key: "expiresAt", label: "Expires At" },
        { key: "optionSize" },
        // { key: "priceNow", label: "Price Now" },
        // { key: "breakEven", label: "Break-even" },
        { key: "profitLoss", label: "P&L" },
        // { key: "placedAt", label: "Placed At" },
        // { key: "expiresIn", label: "Expiry" },
        { key: "exercise", label: "Exercise" },
      ],
    };
  },
  methods: {
    async getMyOptions() {
      
      let tableItems = await ERC20OptionsAPI.getMyOptions();
      await LiquidityPoolAPI.getMarketList();

      var now = new Date();
      // now.setDate(now.getDate() + 28 * 3);

      this.tableItemsActive = tableItems.filter(
        (x) => new Date(x.expiration * 1000) >= now
      );
      this.tableItemsExpired = tableItems.filter(
        (x) => new Date(x.expiration * 1000) < now
      );
      console.log("tableItems:", tableItems);

      if (this.showActive) {
        this.tableItems = this.tableItemsActive;
      } else {
        this.tableItems = this.tableItemsExpired;
      }
    },
    async getLatestPrice() {
      this.latestPrice = await ERC20OptionsAPI.getLatestPrice();
    },
    changeToggle(action) {
      this.showActive = action.value;
      if (this.showActive) {
        this.tableItems = this.tableItemsActive;
      } else {
        this.tableItems = this.tableItemsExpired;
      }
    },

    getType(item) {
      return item.optionType == ERC20OptionsAPI.OptionType.Put ? "Short(Put)" : "Long(Call)";
    },
    getMarket(item) {
      // console.log("getMarket:item:",item)
      // console.log("store.marketList:",store.marketList)
      return store.marketList[item.marketId].text;
      // return "m";
    },
    getSize(item) {
      return (item.optionSize / 1e9).toFixed(4);
    },
    getStrikePrice(item) {
      return oracleToCents(item.strike).toFixed(2);
      // return gweiToCents(item.strike) * 100;
    },
    getLatestPrice(item) {
      // console.log("latest:",store.marketList[item.marketId].latestPrice)
      return oracleToCents(store.marketList[item.marketId].latestPrice)/10;
    },
    getPremiumUSD(item) {
      return (+this.getLatestPrice(item) * +item.premium) / 1e18;
    },
    getBreakeven(item) {
      // console.log("item.strike:", item.strike / 1e8); //gwei
      // console.log("item.premium:", +item.premium / 1e18); //wei
      // console.log("item.optionSize:", +item.optionSize / 1e9); //gwei
      // console.log("getLatestPrice:", +this.getLatestPrice(item));
      // console.log("getPremiumUSD:", +this.getPremiumUSD(item));

      //premiumUSD= (gweiToCents(this.latestPrice) * 10 * this.displayTotal)

      if (item.optionType == ERC20OptionsAPI.OptionType.Call) {
        //strikePrice + (totalUSD/optionSize)
        return (
          item.strike / 1e8 +
          this.getPremiumUSD(item) * (+item.optionSize / 1e9)
        )/10;
      } else {
        return (
          item.strike / 1e8 -
          this.getPremiumUSD(item) * (+item.optionSize / 1e9)
        )/10;
      }

      // if (this.sentiment == "long") {
      //     //strikePrice + (totalUSD/optionSize)
      //     return (
      //       this.strikePrice * 10 +
      //       this.displayTotalUSD / this.optionSize
      //     ).toFixed(2);
    },
    getProfitLoss(item) {
      // console.log("getBreakeven:", +this.getBreakeven(item));
      // console.log("getLatestPrice:", +this.getLatestPrice(item));
      this.getBreakeven(item);
      if (item.optionType == ERC20OptionsAPI.OptionType.Call) {
        return (+this.getLatestPrice(item) - +this.getBreakeven(item)).toFixed(
          2
        );
      } else {
        return (+this.getBreakeven(item) - +this.getLatestPrice(item)).toFixed(
          2
        );
      }
    },
    getPlacedAt(item) {
      return "pa";
    },
    getExpiresAt(item) {
      return new Date(item.expiration * 1000).toLocaleDateString(undefined, {
        hour: "numeric",
        minute: "numeric",
      });
    },
    // getExpiresIn(item) {
    //   return this.timeDiffCalc(new Date(item.expiration * 1000), Date.now());
    // },
    displayExercise(item) {
      if (! this.showActive || item.state != ERC20OptionsAPI.OptionState.Active) {
        return false;
      }

      if (item.optionType == ERC20OptionsAPI.OptionType.Call) {  
        return +item.strike <= +store.marketList[item.marketId].latestPrice/10;
      } else {
        return +item.strike >= +store.marketList[item.marketId].latestPrice/10;
      }
    },
    cantDisplayExercise(item) {
      if (item.state == ERC20OptionsAPI.OptionState.Exercised) {
        return "Exercised";
      }
      if (! this.showActive){
        return "Expired";
      }

    },
    async setExercise(item) {
      let response = await ERC20OptionsAPI.setExercise(item.id);
    },
  },
  mounted() {
    if (store.userWeb3Connected){
      this.getMyOptions();
    }
    EventBus.$on("userWeb3Connected", () => {
      this.getMyOptions();
    });

    EventBus.$on("userWeb3Disconnected", () => {
      this.tableItems = [];
      this.tableItemsActive = [];
      this.tableItemsExpired = [];
    });

    EventBus.$on("ERC20Options:create:receipt", () => {
      this.getMyOptions();
    });

    EventBus.$on("ERC20Options:exercise:receipt", () => {
      this.getMyOptions();
    });
  },
};
</script>

<style></style>
<template>
  <CCard>
    <CCardHeader>
      Your Contracts
    </CCardHeader>
    <CCardBody>
      <b-row>
        <b-col cols="12">
          <toggle-button
            id="toggle"
            :value="showActive"
            :labels="{
              checked: 'Active',
              unchecked: 'Expired',
            }"
            :color="{
              checked: '#007bff',
              unchecked: '#007bff',
              disabled: '#CCCCCC',
            }"
            :font-size="toggleFontSize"
            :width="toggleWidth"
            :height="toggleHeight"
            @change="changeToggle"
          />
        </b-col>
      </b-row>
      <CDataTable
        class="mb-0 table-outline"
        hover
        :items="tableItems"
        :fields="tableFields"
        head-color="light"
        no-sorting
      >
        <td slot="type" class="text-center" slot-scope="{ item }">
          <div>
            {{ getType(item) }}
          </div>
        </td>

        <td slot="market" class="text-center" slot-scope="{ item }">
          <div>
            {{ getMarket(item) }}
          </div>
        </td>

        <td slot="strikePrice" class="text-center" slot-scope="{ item }">
          <div>${{ getStrikePrice(item) }}</div>
        </td>

        <td slot="expiresAt" class="text-center" slot-scope="{ item }">
          <div>
            {{ getExpiresAt(item) }}
          </div>
        </td>

        <td slot="optionSize" class="text-center" slot-scope="{ item }">
          <div>
            {{ getSize(item) }}
          </div>
        </td>

        <!-- <td slot="priceNow" class="text-center" slot-scope="{ item }">
          <div>${{ getLatestPrice(item) }}</div>
        </td> -->

        <!-- <td slot="breakEven" class="text-center" slot-scope="{ item }">
          <div>${{ getBreakeven(item) }}</div>
        </td> -->

        <td slot="profitLoss" class="text-center" slot-scope="{ item }">
          <div>${{ getProfitLoss(item) }}</div>
        </td>

        <!-- <td slot="placedAt" class="text-center" slot-scope="{ item }">
          <div>
            {{ getPlacedAt(item) }}
          </div>
        </td> -->

        <!-- <td slot="expiresIn" class="text-center" slot-scope="{ item }">
          <div>
            {{ getExpiresIn(item) }}
          </div>
        </td> -->

        <td slot="exercise" class="text-center" slot-scope="{ item }">
          <div v-if="displayExercise(item)">
            <b-button block variant="success" @click="setExercise(item)"
              >Exercise</b-button
            >
          </div>
          <div v-if="! displayExercise(item)">
            <div>{{ cantDisplayExercise(item) }}</div>
          </div>          
        </td>
      </CDataTable>
    </CCardBody>
  </CCard>
</template>
