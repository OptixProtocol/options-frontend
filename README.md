Setup

- download options-contracts & options-frontend
- npm install in both of them
- start ganache
- check truffle-config.js has correct ganache config

Run tests

- cd options-contracts
- truffle test

Run website

- cd options-contracts
- truffle migrate
- update 3 dev contract addresses in options-frontend\src\static\Addresses.json
- cd options-frontend
- npm run serve
- If your aren't running ganache on http://127.0.0.1:7545 change hardcoding in
  options-frontend\src\api\Store.js - line 58

Add Liquidity

- Open remix & point to ganache
- Add contracts
  - Interfaces\Interfaces.sol
  - test-helpers\TestImplementations.sol
- Uncomment / comment imports
- Mint WBTC, WETH

