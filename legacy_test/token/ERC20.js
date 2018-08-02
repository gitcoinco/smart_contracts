var tools = require('../tools');
var BasicERC20 = artifacts.require("./BasicERC20Token.sol");

contract("BasicERC20", function(accounts) {

//CREATION

    it("creation: should create an initial balance of 0 for the creator", function(done) {
        BasicERC20.new( {from: accounts[0]}).then(function(ctr) {
            return ctr.balanceOf.call(accounts[0]);
    }).then(function (result) {
        assert.strictEqual(result.toNumber(), 0);
        done();
        }).catch(done);
    });

    it("creation: test correct setting of vanity information", function(done) {
      var ctr;
    BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.name.call();
    }).then(function (result) {
        assert.strictEqual(result, 'BasicERC20');
        return ctr.decimals.call();
    }).then(function(result) {
        assert.strictEqual(result.toNumber(), 18);
        return ctr.symbol.call();
    }).then(function(result) {
        assert.strictEqual(result, 'ERC');
        done();
        }).catch(done);
    });

//TRANSERS
//normal transfers without approvals.

    //this is not *good* enough as the contract could still throw an error otherwise.
    //ideally one should check balances before and after, but estimateGas currently always throws an error.
    //it's not giving estimate on gas used in the event of an error.
    it("transfers: ether transfer should be reversed.", function(done) {
        var ctr;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return web3.eth.sendTransaction({from: accounts[0], to: ctr.address, value: web3.toWei("10", "Ether")});
        }).catch(function(result) {
            done();
        }).catch(done);
    });


    it("transfers: should transfer 600000000 to accounts[1] with accounts[0] having 600000000", function(done) {
        var ctr;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[0], 600000000, {from: accounts[0]});
        }).then(function (result) {
            return ctr.transfer(accounts[1], 600000000, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[1]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), 600000000);
            done();
        }).catch(done);
    });

    it("transfers: should fail when trying to transfer 600000001 to accounts[1] with accounts[0] having 600000000", function(done) {
        var ctr;
        var hasErrored = false;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[0], 600000000, {from: accounts[0]});
        }).then(function (result) {
            return ctr.transfer(accounts[1], 600000001, {from: accounts[0]});
        }).catch(function (error) {
            assert.strictEqual( error.toString().indexOf('Exception') != -1 ,true);
            hasErrored = true;
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[1]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), 0);
            assert.strictEqual(hasErrored, true);
            done();
        }).catch(done);
    });

    it("transfers: should fail when trying to transfer negative amount.", function(done) {
        var ctr;
        var hasErrored = false;
        var amount = 1000;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[1], amount, {from: accounts[0]});
        }).then(function (result) {
            return ctr.transfer.call(accounts[1], -1, {from: accounts[0]});
        }).catch(function (error) {
            assert.strictEqual( error.toString().indexOf('Exception') != -1 ,true);
            hasErrored = true;
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[1]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), amount);
            assert.strictEqual(hasErrored, true);
            done();
        }).catch(done);
    });

    //NOTE: testing uint256 wrapping is impossible in this standard token since you can't supply > 2^256 -1.

    //todo: transfer max amounts.

//APPROVALS

    it("approvals: msg.sender should approve 100 to accounts[1]", function(done) {
        var ctr = null;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function (result) {
            return ctr.allowance.call(accounts[0], accounts[1]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), 100);
            done();
        }).catch(done);
    });

    //bit overkill. But is for testing a bug
    it("approvals: msg.sender approves accounts[1] of 100 & withdraws 20 once.", function(done) {
        var ctr = null;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[1], 200, {from: accounts[0]});
        }).catch(function (error) {
            return ctr.approve(accounts[0], 0, {from: accounts[1]});
        }).then(function (result) {
            return ctr.approve(accounts[0], 100, {from: accounts[1]});
        }).then(function (result) {
            return ctr.transferFrom(accounts[1], accounts[2], 20, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[2]);
        }).then(function (result) {
              assert.strictEqual(result.toNumber(), 20);
              done();
        }).catch(done);
    });

    //should approve 100 of msg.sender & withdraw 50, twice. (should succeed)
    it("approvals: msg.sender approves accounts[1] of 100 & withdraws 20 twice.", function(done) {
        var ctr = null;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[1], 200, {from: accounts[0]});
        }).catch(function (error) {
            return ctr.approve(accounts[0], 0, {from: accounts[1]});
        }).then(function (result) {
            return ctr.approve(accounts[0], 100, {from: accounts[1]});
        }).then(function (result) {
            return ctr.transferFrom(accounts[1], accounts[2], 20, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[2]);
        }).then(function (result) {
              assert.strictEqual(result.toNumber(), 20);
            return ctr.transferFrom(accounts[1], accounts[2], 20, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[2]);
        }).then(function (result) {
              assert.strictEqual(result.toNumber(), 40);
            return ctr.balanceOf.call(accounts[1]);
        }).then(function (result) {
              assert.strictEqual(result.toNumber(), 160);
              done();
        }).catch(done);
    });

    //should approve 100 of msg.sender & withdraw 50 & 60 (should fail).
    it("approvals: msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)", function(done) {
        var ctr = null;
        var hasErrored = false;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[1], 200, {from: accounts[0]});
        }).catch(function (error) {
            return ctr.approve(accounts[0], 0, {from: accounts[1]});
        }).then(function (result) {
            return ctr.approve(accounts[0], 100, {from: accounts[1]});
        }).then(function (result) {
            return ctr.transferFrom(accounts[1], accounts[2], 50, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[2]);
        }).then(function (result) {
              assert.strictEqual(result.toNumber(), 50);
            return ctr.transferFrom(accounts[1], accounts[2], 60, {from: accounts[0]});
        }).catch(function (error) {
            assert.strictEqual( error.toString().indexOf('Exception') != -1 ,true);
            hasErrored = true;
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[2]);
        }).then(function (result) {
              assert.strictEqual(result.toNumber(), 50);
            assert.strictEqual(hasErrored, true);
              done();
        }).catch(done);
    });


    it("approvals: attempt withdrawal from account with no allowance (should fail)", function(done) {
        var ctr = null;
        var hasErrored = false;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[1], 200, {from: accounts[0]});
        }).then(function (result) {
            return ctr.transferFrom(accounts[1], accounts[2], 50, {from: accounts[0]});
        }).catch(function (error) {
            assert.strictEqual( error.toString().indexOf('Exception') != -1 ,true);
            hasErrored = true;
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[1]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), 200);
            assert.strictEqual(hasErrored, true);
            done();
        }).catch(done);
    });

    it("approvals: allow accounts[1] 100 to withdraw from accounts[0]", function(done) {
        var ctr = null;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[1], 200, {from: accounts[0]});
        }).catch(function (error) {
            return ctr.approve(accounts[0], 0, {from: accounts[1]});
        }).then(function (result) {
            return ctr.approve(accounts[0], 100, {from: accounts[1]});
        }).then(function (result) {
            return ctr.transferFrom(accounts[1], accounts[2], 60, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[2]);
        }).then(function (result) {
              assert.strictEqual(result.toNumber(), 60);
              done();
        }).catch(done);
    });

    it("approvals: approve max (2^256 - 1)", function(done) {
        var ctr = null;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.approve(accounts[1],'115792089237316195423570985008687907853269984665640564039457584007913129639935' , {from: accounts[0]});
        }).then(function (result) {
            return ctr.allowance(accounts[0], accounts[1]);
        }).then(function (result) {
            var match = result.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77');
            assert.isTrue(match);
            done();
        }).catch(done);
    });

    it("can't mint more than max (2^256)", function(done) {
        var ctr;
        var hasErrored = false;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[0], 2**256 + 1, {from: accounts[0]});
        }).catch(function (error) {
            assert.strictEqual( error.toString().indexOf('Exception') != -1 ,true);
            hasErrored = true;
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[0]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), 0);
            assert.strictEqual(hasErrored, true);
            done();
        }).catch(done);    
    });

    it("can't mint once finishMinting() is called", function(done) {
        var ctr;
        var hasErrored = false;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[0], 600000000, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[0]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), 600000000);
            return ctr.finishMinting({from: accounts[0]});
        }).then(function (result) {
            return ctr.mintingFinished();
        }).then(function (result) {
            assert.strictEqual(result, true)
            return ctr.mint(accounts[0], 600000000, {from: accounts[0]});
        }).catch(function (error) {
            assert.strictEqual( error.toString().indexOf('Exception') != -1 ,true);
            hasErrored = true;
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[0]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), 600000000);
            assert.strictEqual(hasErrored, true);
            done();
        }).catch(done);    
    });

    it("can't mint once targetTotalSupply() is reached", function(done) {
        var ctr;
        BasicERC20.new( {from: accounts[0]}).then(function(result) {
            ctr = result;
            return ctr.mint(accounts[0], tools.weiPerEther() * 600000000, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[0]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), tools.weiPerEther() * 600000000);
            return ctr.mint(accounts[0], 1, {from: accounts[0]});
        }).then(function (result) {
            return ctr.balanceOf.call(accounts[0]);
        }).then(function (result) {
            assert.strictEqual(result.toNumber(), tools.weiPerEther() * 600000000);
            done();
        }).catch(done);    
    });

    it("totalsupply always equals minted amount.", async function() {
        var ctr = await BasicERC20.new({from: accounts[0]});

        var amounts =[1, 50, 55, 90, 10000, 2091, 1111];
        var runningTotalAmount = 0;

        for (var i = 0; i < amounts.length; i++) { 
            var thisAmount = amounts[i];
            await ctr.mint(accounts[0], thisAmount);
            runningTotalAmount += thisAmount;

            let balance0 = await ctr.balanceOf(accounts[0]);
            assert(balance0, runningTotalAmount);
            
            let totalSupply = await ctr.totalSupply();
            assert(totalSupply, runningTotalAmount);
        }
        });

});