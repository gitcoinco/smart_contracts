import "../zeppelin-solidity/contracts/token/StandardToken.sol";
import "../shared/strings.sol";

pragma solidity ^0.4.8;

contract BountyIndex {
  using strings for *;

  // ------- Struct for holding bounties ---
  struct bounty {
    uint amount;
    address bountyOwner;
    address claimee;
    string claimee_metaData;
    uint creationTime;
    uint expirationTime;
    bool initialized;
    string issueURL;
    string metaData;
    bool open;
    address tokenAddress;
  }

  mapping (bytes32 => bounty) public Bounties;
  mapping (bytes32 => uint) public bountiesbyrepo;
  uint public numBounties = 0;
  bytes32[] public bounty_indices;

  // ---- Modifiers --------
  modifier onlyBountyOwner(address _from, string _issueURL){
    bounty memory b = Bounties[strToMappingIndex(_issueURL)];
    require(b.bountyOwner == _from);
    _;
  }

  modifier onlyBountyNotClaimed(string _issueURL){
    bounty memory b = Bounties[strToMappingIndex(_issueURL)];
    require(b.claimee == 0x0);
    require(b.open == true);
    _;
  }
  modifier onlyBountyClaimed(string _issueURL){
    bounty memory b = Bounties[strToMappingIndex(_issueURL)];
    require(b.claimee != 0x0);
    _;
  }
  modifier onlyBountyOpen(string _issueURL){
    bounty memory b = Bounties[strToMappingIndex(_issueURL)];
    require(b.open == true);
    _;
  }
  modifier onlyBountyExpired(string _issueURL){
    bounty memory b = Bounties[strToMappingIndex(_issueURL)];
    require(b.expirationTime < now);
    _;
  }

  // ----- Functions -------

  function postBounty(
    string memory _issueURL,
    uint _amount,
    address _tokenAddress,
    uint _expirationTimeDelta,
    string memory _metaData
    ) payable public returns (bool) {
    require(_tokenAddress == 0x0 || msg.value == 0);
    //transfer funds
    if(_tokenAddress != 0x0){
      //ERC20 token
      StandardToken token = StandardToken(_tokenAddress);
      token.transferFrom(msg.sender, this, _amount);
     } else {
      //Ether
      require(_amount == msg.value);
      require(msg.value > 0);
     }

     //only one bounty per issueURL at a time (for now)
     require(Bounties[strToMappingIndex(_issueURL)].open == false);

    //create bounty
    bounty memory b;
    b.amount = _amount;
    b.bountyOwner = msg.sender;
    b.claimee = 0x0;
    b.creationTime = now;
    b.expirationTime = now + _expirationTimeDelta;
    b.initialized = true;
    b.issueURL = _issueURL;
    b.metaData = _metaData;
    b.open = true;
    b.tokenAddress = _tokenAddress;
    Bounties[strToMappingIndex(_issueURL)] = b;

    //event
    bountyPosted(msg.sender, _issueURL, _amount);

    //some housekeeping
    bounty_indices.push(strToMappingIndex(_issueURL));
    numBounties +=1 ;
    bountiesbyrepo[strToMappingIndex(getRepoURL(_issueURL))] += 1;

    return true;
  }


  function claimBounty(string _issueURL, string _claimee_metaData) onlyBountyNotClaimed(_issueURL) {
    bytes32 idx = strToMappingIndex(_issueURL);
    bountyClaimed(msg.sender, _issueURL);
    Bounties[idx].claimee = msg.sender;
    Bounties[idx].claimee_metaData = _claimee_metaData;
  }

  function approveBountyClaim(string _issueURL) onlyBountyOwner(msg.sender, _issueURL) onlyBountyClaimed(_issueURL) onlyBountyOpen(_issueURL) {
    bounty storage b = Bounties[strToMappingIndex(_issueURL)];
    require(b.amount != 0);
    b.open = false;
    b.initialized = false;
    if(b.tokenAddress != 0x0){
      //erc20
      StandardToken token = StandardToken(b.tokenAddress);
      token.transfer(b.claimee, b.amount);
    } else {
      //eth
      b.claimee.transfer(b.amount);
    }
    bountyClaimApproved(msg.sender, b.claimee, _issueURL);
  }

  function clawbackExpiredBounty(string _issueURL) onlyBountyOwner(msg.sender, _issueURL) onlyBountyExpired(_issueURL) onlyBountyOpen(_issueURL) {
    bounty storage b = Bounties[strToMappingIndex(_issueURL)];
    require(b.amount != 0);
    b.open = false;
    b.initialized = false;
    if(b.tokenAddress != 0x0){
      //erc20
      StandardToken token = StandardToken(b.tokenAddress);
      token.transfer(b.bountyOwner, b.amount);
    } else {
      //eth
      b.bountyOwner.transfer(b.amount);
    }
    bountyExpired(msg.sender, _issueURL);
  }

  function rejectBountyClaim(string _issueURL) onlyBountyOwner(msg.sender, _issueURL) onlyBountyClaimed(_issueURL) onlyBountyOpen(_issueURL) {
    bounty storage b = Bounties[strToMappingIndex(_issueURL)];
    b.claimee = 0x0;
    b.claimee_metaData = "";
    bountyClaimRejected(msg.sender, _issueURL);
  }

  // ------- getter functions -----------
  function bountydetails(string _issueURL) returns (uint, address, address, address, bool, bool, string, uint, string, uint, string) {
    return _bountydetails(strToMappingIndex(_issueURL));
  }

  function _bountydetails(bytes32 index) returns (uint, address, address, address, bool, bool, string, uint, string, uint, string) {
    bounty memory b = Bounties[index];
    return (b.amount, b.tokenAddress, b.bountyOwner, b.claimee, b.open, b.initialized, b.issueURL, b.creationTime, b.metaData, b.expirationTime, b.claimee_metaData);
  }

  // ------- helper functions -----------

  //accepts a repo URL with a trailing slash, like https://github.com/owocki/pytrader/
  function getNumberBounties(string _repoURL) returns (uint) {
    return bountiesbyrepo[strToMappingIndex(_repoURL)];
  }

  //normalizes https://github.com/owocki/pytrader/pull/83 and https://github.com/owocki/pytrader/pull/83/ (trailing slash)
  //future: 
  //or https://Github.com/owocki/pytrader/pull/83 and https://github.com/owocki/pytrader/pull/83 (capitalization)
  function normalizeIssueURL(string memory str) returns (string result) {
      if(!str.toSlice().endsWith('/'.toSlice())){
        str = str.toSlice().concat('/'.toSlice()); 
      }
      return str;
  }

  //https://github.com/owocki/pytrader/pull/83 returns https://github.com/owocki/pytrader/
  function getRepoURL(string memory str) returns (string result){
      string memory _type =  'issue';
      if (str.toSlice().contains('pull'.toSlice())){
        _type =  'pull';
      }
    var s = str.toSlice();
    strings.slice memory part;
    s.split(_type.toSlice(), part);
    return part.toString();
  }

  function strToMappingIndex(string memory str) returns (bytes32 result) {
      return keccak256(normalizeIssueURL(str));
  }

// ------- events -----------
event bountyPosted(address _from, string issueURL, uint amount);
event bountyClaimed(address _from, string issueURL);
event bountyExpired(address _from, string issueURL);
event bountyClaimApproved(address _from, address payee, string issueURL);
event bountyClaimRejected(address _from, string issueURL);



}
