var BountyIndex = artifacts.require("./BountyIndex.sol");
var Gitcoin = artifacts.require("./GitcoinToken.sol");
var tools = require('../tools');

contract("BountyIndex", function(accounts) {

//CREATION

    var issueURL = "https://github.com/owocki/pytrader/issues/46";
    var issueURLWithSlash = issueURL + '/';
    var amount = 100;
    var expirationTime = 60 * 60;
    var issueTitle = "Test issue 123";
    var issueKeywords = "python, solidity, javascript";
    var metadata = '{experienceLevel: "Senior", type: "bug", length: "weeks", fromEmail: "kevin@gitcoin.co", fromUsername: "owocki"}';
    var claimee_metadata = '{fromEmail: "kevin@gitcoin.co", fromUsername: "owocki"}';


    it("Bounty is posted and approved (ERC20)", async function() {
        //config
        var gitcoin = await Gitcoin.new({from: accounts[0]});
        var bountyindex = await BountyIndex.new({from: accounts[0]});
        var tokenAddress = gitcoin.address;

        //create coins
        await gitcoin.mint(accounts[0], amount);
        await gitcoin.approve(bountyindex.address, amount);

        //post bounty
        await bountyindex.postBounty(issueURL, amount, tokenAddress, expirationTime, metadata, {from: accounts[0]});

        //verify bounty posted
        var bountydetail = await bountyindex.bountydetails.call(issueURLWithSlash);
        assert.isTrue(bountydetail[0].toNumber() == amount);
        assert.isTrue(bountydetail[1] == tokenAddress);
        var numBounties = await bountyindex.numBounties.call();
        assert.isTrue(numBounties == 1);

        //verify escrow balance
        var escrowBalance = await gitcoin.balanceOf.call(bountyindex.address);
        assert.strictEqual(escrowBalance.toNumber(), amount);

        //claim bounty
        await bountyindex.claimBounty(issueURLWithSlash, claimee_metadata, {from: accounts[1]});

        //approve bounty
        await bountyindex.approveBountyClaim(issueURLWithSlash, {from: accounts[0]});

        //verify claimee balance is updated
        var claimeeBalance = await gitcoin.balanceOf.call(accounts[1]);
        assert.strictEqual(claimeeBalance.toNumber(), amount);


    });

    it("Bounty is posted and approved (Ether)", async function() {
        //config
        var bountyindex = await BountyIndex.new({from: accounts[0]});
        var _amount = 1 * tools.weiPerEther();
        var _tokenAddress = '0x0000000000000000000000000000000000000000';

        //post bounty
        await bountyindex.postBounty(issueURL, _amount, _tokenAddress, expirationTime, metadata, {from: accounts[0], value: _amount});

        //verify bounty posted
        var bountydetail = await bountyindex.bountydetails.call(issueURLWithSlash);
        assert.isTrue(bountydetail[0].toNumber() == _amount);
        assert.isTrue(bountydetail[1] == _tokenAddress);
        var numBounties = await bountyindex.numBounties.call();
        assert.isTrue(numBounties == 1);

        //verify escrow balance
        var escrowBalance = await web3.eth.getBalance(bountyindex.address);
        assert.strictEqual(escrowBalance.toNumber(), _amount);

        //claim bounty
        await bountyindex.claimBounty(issueURLWithSlash, claimee_metadata, {from: accounts[1]});

        //approve bounty
        var claimeeBalanceBefore = await web3.eth.getBalance(accounts[1]);
        await bountyindex.approveBountyClaim(issueURLWithSlash, {from: accounts[0]});

        //verify claimee balance is updated
        var claimeeBalanceAfter = await web3.eth.getBalance(accounts[1]);
        assert.strictEqual(claimeeBalanceAfter.toNumber() - claimeeBalanceBefore.toNumber(), _amount);


    });

    it("Bounty is posted, expired, and clawed back", async function() {
        //config
        var bountyindex = await BountyIndex.new({from: accounts[0]});
        var _amount = 1 * tools.weiPerEther();
        var _tokenAddress = '0x0000000000000000000000000000000000000000';

        var senderBalanceBefore = await web3.eth.getBalance(accounts[0]);

        //post bounty
        await bountyindex.postBounty(issueURL, _amount, _tokenAddress, expirationTime, metadata, {from: accounts[0], value: _amount});

        var bountydetail = await bountyindex.bountydetails.call(issueURLWithSlash);

        //clawback will fail if bounty is not expired yet
        var gotError = false;
        try{
          await bountyindex.clawbackExpiredBounty(issueURLWithSlash, {from: accounts[0]});
        } catch(error) {
          gotError = true;
        }

        assert.isTrue(gotError);

        await tools.increaseTime(expirationTime + 10);
        await bountyindex.clawbackExpiredBounty(issueURLWithSlash, {from: accounts[0]});

        //verify claimee balance is updated
        var senderBalanceAfter = await web3.eth.getBalance(accounts[0]);

        var priceDelta = senderBalanceBefore.toNumber() - senderBalanceAfter.toNumber();
        console.log(priceDelta);
        assert.isTrue(priceDelta < 6160960 ); // delta should be gas fees, nothing more
    });


    it("Bounty is posted and rejected", async function() {

        //config
        var gitcoin = await Gitcoin.new({from: accounts[0]});
        var bountyindex = await BountyIndex.new({from: accounts[0]});
        var tokenAddress = gitcoin.address;

        //create coins
        await gitcoin.mint(accounts[0], amount);
        await gitcoin.approve(bountyindex.address, amount);

        //post bounty
        await bountyindex.postBounty(issueURL, amount, tokenAddress, expirationTime, metadata, {from: accounts[0]});

        //verify bounty posted
        var numBounties = await bountyindex.numBounties.call();
        assert.isTrue(numBounties == 1);

        //verify escrow balance
        var escrowBalance = await gitcoin.balanceOf.call(bountyindex.address);
        assert.strictEqual(escrowBalance.toNumber(), amount);

        //claim bounty
        await bountyindex.claimBounty(issueURL, claimee_metadata, {from: accounts[1]});

        //reject bounty
        await bountyindex.rejectBountyClaim(issueURL, {from: accounts[0]});

        // verify claim status remains open
        // var claimStatus = await bountyindex.Bounties[BountyIndex.stringToBytes32Hash(issueURL)].open.call();
        // assert.isTrue(claimStatus == true);

        // verify bounty claimee is 0x0

    });


    it("Bounty attempted to be posted, but user does not have sufficient balance", async function() {
      //config
      var gitcoin = await Gitcoin.new({from: accounts[0]});
      var bountyindex = await BountyIndex.new({from: accounts[0]});
      var tokenAddress = gitcoin.address;

      //create coins
      await gitcoin.mint(accounts[0], amount);
      await gitcoin.approve(bountyindex.address, 99);

      try {
          await bountyindex.postBounty(issueURL, amount, tokenAddress, expirationTime, metadata, {from: accounts[0], gas: 9999999});
      } catch (e) {
        console.log('Bounty cannot be posted, insufficient balance');
      }

    });

    it("Non-bountyOwner claim approval failure", async function() {
      //config
      var gitcoin = await Gitcoin.new({from: accounts[0]});
      var bountyindex = await BountyIndex.new({from: accounts[0]});
      var tokenAddress = gitcoin.address;

      //create coins
      await gitcoin.mint(accounts[0], amount);
      await gitcoin.approve(bountyindex.address, amount);

      //post bounty
      await bountyindex.postBounty(issueURL, amount, tokenAddress, expirationTime, metadata, {from: accounts[0]});

      //claim bounty
      await bountyindex.claimBounty(issueURL, claimee_metadata, {from: accounts[1]});

      //approve bounty from Non-bountyOwner failure
      try {
        await bountyindex.approveBountyClaim(issueURL, {from: accounts[1]});
      } catch (e) {
        console.log('Approval failed, not bountyOwner');
      }
    });

    it("Non-bountyOwner claim rejection failure", async function() {
      //config
      var gitcoin = await Gitcoin.new({from: accounts[0]});
      var bountyindex = await BountyIndex.new({from: accounts[0]});
      var tokenAddress = gitcoin.address;

      //create coins
      await gitcoin.mint(accounts[0], amount);
      await gitcoin.approve(bountyindex.address, amount);

      //post bounty
      await bountyindex.postBounty(issueURL, amount, tokenAddress, expirationTime, metadata, {from: accounts[0]});

      //claim bounty
      await bountyindex.claimBounty(issueURL, claimee_metadata, {from: accounts[1]});

      //approve bounty from Non-bountyOwner failure
      try {
        await bountyindex.rejectBountyClaim(issueURL, {from: accounts[2]});
      } catch (e) {
        console.log('Rejection failed, not bountyOwner');
      }
    });


    it("test getGetRepoURL", async function() {
        //config
        var gitcoin = await Gitcoin.new({from: accounts[0]});
        var bountyindex = await BountyIndex.new({from: accounts[0]});
        var tokenAddress = gitcoin.address;

        //create coins
        var repoURL = await bountyindex.getRepoURL.call(issueURL);
        assert.strictEqual( repoURL.toString(), "https://github.com/owocki/pytrader/" );
    });


});
