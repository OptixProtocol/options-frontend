import Web3 from "web3";
const toBN = Web3.utils.toBN;

var U = {

    // gweiToCents(x) {
    //     console.log("gweiToCents:", x);
    //     return (toBN(x).div(toBN(1e6)) / 100)
    // },
    // centsToGwei(x) {
    //     console.log("centsToGwei:", x);
    //     return (toBN(x * 100).mul(toBN(1e6)))
    // },

    increaseTime(seconds) {
        web3.currentProvider.send({ method: "evm_increaseTime", params: [seconds] });
    }
  // foo () { console.log('foo') },
  // bar () { console.log('bar') },
  // baz () { console.log('baz') }
}

export default U