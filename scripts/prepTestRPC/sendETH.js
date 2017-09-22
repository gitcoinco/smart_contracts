var GitcoinToken = artifacts.require("./token/GitcoinToken.sol");
var tools = require('../test/tools');

var args = process.argv.slice(2);

var to_address = args[2];
var amount = args[3];

var send_from_address = web3.eth.accounts[0];

if(typeof to_address == 'undefined' || typeof amount == 'undefined'){
    console.log('invalid arguments');
    process.exit();
}

module.exports = function(callback) {
    var amountInWei = amount * tools.weiPerEther();
    const gasPrice = 100000000000;
    const gas = 2500000;
    web3.eth.sendTransaction({from: send_from_address, to: to_address, value: amountInWei, gas:gas, gasPrice: gasPrice}, function(errors,reuslts){
        console.log(errors, reuslts);
        console.log(web3.eth.getBalance(to_address));
        callback();
    });
}