// tools.js
module.exports = {
  increaseTime: function (addSeconds) {
    web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});
    web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
  },
  vestTime: function () {
    return vestTime = 60 * 60 * 24 * 30;
  },
    weiPerEther: function(){
      return 1000000000000000000;
    },
    gitcoinSupply: function(){
      return 600 * 1000 * 1000;
    },
    etherPerWei: function(){
      return 1/1000000000000000000;
    }
};
