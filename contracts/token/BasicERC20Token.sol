import "../zeppelin-solidity/contracts/token/MintableToken.sol";

pragma solidity ^0.4.8;

contract BasicERC20Token is MintableToken {

    function () {
        //if ether is sent to this address, send it back.
        throw;
    }

    string public name = "BasicERC20";
    uint8 public decimals = 18;
    string public symbol = "ERC";
    string public version = '0.1';

  function mint(address _to, uint256 _amount) canMint onlyOwner returns (bool) {

    // never ever ever allow total supply to be higher than foreverMaxSupply
    uint256 foreverMaxSupply = 1000000000000000000 * 600000000; //600000000 GIT
    if (totalSupply > foreverMaxSupply) {
        finishMinting();
        return false;
    }

    super.mint(_to, _amount);
  }


}