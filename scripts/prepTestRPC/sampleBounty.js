var GitcoinToken = artifacts.require("./token/GitcoinToken.sol");
var BountyIndex = artifacts.require("./bounty/BountyIndex.sol");
var tools = require('../../test/tools');

var args = process.argv.slice(2);

var bounty_address = args[2];
var tokenAddress = args[3];

var deploy_from_address = web3.eth.accounts[0];
var issueURL = "https://github.com/owocki/pytrader/issues/" + Math.floor(Math.random(0,100) * 100);;
var amount = Math.floor(Math.random(0,100) * 10000) * tools.weiPerEther();
var fromUsername = "owocki";
var fromEmail = 'kevin@gitcoin.co';


//console.log('args',token_address, to_address, amount)

if(typeof tokenAddress == 'undefined' || typeof bounty_address == 'undefined' || typeof amount == 'undefined'){
    console.log('invalid arguments');
    process.exit();
}

module.exports = async function() {

    gitcoin = GitcoinToken.at(tokenAddress);
    bountyindex = BountyIndex.at(bounty_address);
    await gitcoin.mint(deploy_from_address, amount);
    await gitcoin.approve(bountyindex.address, amount);
    await bountyindex.postBounty(issueURL, amount, tokenAddress,  fromUsername, fromEmail);


}