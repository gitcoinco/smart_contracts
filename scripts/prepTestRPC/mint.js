var GitcoinToken = artifacts.require("./token/GitcoinToken.sol");
var tools = require('../test/tools');

var args = process.argv.slice(2);

var token_address = args[2];
var to_address = args[3];
var amount = args[4];

var deploy_from_address = web3.eth.accounts[0];

//console.log('args',token_address, to_address, amount)

if(typeof token_address == 'undefined' || typeof to_address == 'undefined' || typeof amount == 'undefined'){
    console.log('invalid arguments');
    process.exit();
}

module.exports = function(callback) {

    gitcoin = GitcoinToken.at(token_address);
    gitcoin.mint(to_address, amount * tools.weiPerEther(), {from: deploy_from_address}).then(function(result){
        gitcoin.balanceOf.call(to_address).then(function(result){
            var balance = result.toNumber() / tools.weiPerEther();
            console.log(balance);
            callback();
        });
    });
}