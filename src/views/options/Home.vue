<template>
  <div>
    <CIcon name="logo" height="48" alt="Logo" src="optyn-logo-170x170.png" />
    <h2>Crypto Option Trading Protocol<br /></h2>
    <br />
    <vue-typed-js
      :strings="[
        'crypto currencies: BTC, ETH, LTC, XRP …',
        'erc20/bip20 tokens: BNB, LINK, UNI, SUSHI …',
        'forex: GBP, AUD, CHF, EUR, CNY, JPY, KRW …',
        'indicies: FTSE, Nikkei, the total crypto market cap …',
        'commodities: gold, silver, oil …',
        'ethereum gas',
        'any new Chainlink price oracles as they are created.<br>The sky is the limit!'
      ]"
      :loop="true"
      :typeSpeed="50"
    >
      <h4>
        Hedge or speculate on
        <span class="typing"></span>
      </h4>
    </vue-typed-js>
    <br />
    <ul>
      <li>
        <CLink href="./trade-options" class="">
          Use the app
        </CLink>
      </li>
      <li><a href="https://discord.gg/8ycMuYt7PS">Discord</a></li>
      <li><a href="https://twitter.com/CryptoOptyn">Twitter</a></li>
      <!-- <li>Read the docs</li>
      <li>FAQ</li>  -->
    </ul>
  </div>
</template>

<script>
export default {};
</script>

<style></style>
