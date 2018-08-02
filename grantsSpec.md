 # [WIP] ERC948 Subscription Standard (v1)

## Summary
The following is a proposed standard for subscription payments with read and write specs.

## Abstract
This standard allows a user to set a recurring payment to a service provider. This recurring transaction is ideally executed by a third party agent, but at a minimum the service provider themselves can execute the payment. Either side of the subscription should be able cancel the agreement with a reasonable amount of forewarning to the other party. This standard or similar should be integrated with future smart wallets to enable subscription payments in the Ethereum ecosystem.

## Motivation
Recurring payments are a widely use monetization method in traditional software. Currently, no such pattern exists with desirable UX traits in the decentralized space. Creating such a pattern will unlock many new avenues for revenue and provide an alternative to the dominant rent seeking and token-valuation based monetization methods in the current ecosystem.

### ERC948 Read

```
interface ERC165 {

@notice Query if a contract implements an interface
@param interfaceID The interface identifier, as specified in ERC-165
@dev Interface identification is specified in ERC-165. This function uses less than 30,000 gas.
@return `true` if the contract implements `interfaceID` and `interfaceID` is not 0xffffffff, `false` otherwise

function supportsInterface(bytes4 interfaceID) external view returns (bool);

}

interface ERC948Read is ERC165 {

@dev Return the details of a subscription
@param subscriptionId - A unique representation of the subscription based on the details of the agreement

function getSubscription(
  	bytes subscriptionId
  )
	public
  view
  returns (
    address _destination,
		address _recipient,
		address _agent,
		uint _agentRewardPct,
		uint _valuePerPeriod,
		uint _secondsPerTimePeriod,
		uint _expiration,
		bool _active
  );

@dev Return array of all subscriptions of contract owner

function getUserSubscriptions()
	public
  view
  returns(
    subscriptions[]
    );
}


interface ERC948Write is ERC948Read {

@dev Creates a new subscription agreement
@param _destination - Contract address of the ERC20 token that is being used for transactions
@param _recipient - Address of the recipient of funds
@param _agent - Individual, organization, or network that performs the transaction on behalf of the subscription owner and recipient
@param _agentRewardPct - Percentage of each transaction the agent will receive as reward
@param _valuePerPeriod - Amount value approved to be exchanged per time period
@param _secondsPerTimePeriod - Seconds to elapse per time period
@param _expiration - Time when subscription expires and must be renewed to continue
@returns subscriptionId - hash of details of subscription to produce unique id

function createSubscription(
    address _destination,
		address _recipient,
		address _agent,
		uint _agentRewardPct,
		uint _valuePerPeriod,
		uint _secondsPerTimePeriod,
		uint _expiration
	)
	public
  returns(
    bytes subscriptionId
    )

@dev revokes the agent ability to perform transactions on behalf of the subscription participants
@param subscriptionId - A unique representation of the subscription based on the details of the agreement

function revokeAgent(
		bytes subscriptionId
	)
	public;

@dev cancels the subscription so no payments are made and whatever service is provided is stopped
@param subscriptionId - A unique representation of the subscription based on the details of the agreement

function cancelSubscription(
		bytes subscriptionId
	)
  public;

@dev executes payment as specified by subscription agreement
@dev ideally called by _agent, but should allow _recipient to call as well

function executePayment(
		bytes subscriptionId
	)
	public;

event newSubscription(
  address _destination,
  address _recipient,
  address _agent,
  uint _agentRewardPct,
  uint _valuePerPeriod,
  uint _secondsPerTimePeriod,
  uint _expiration,
  bool _active,
  bytes subscriptionId
  );

event agentRevoked(bytes subscriptionId, address _agentAddress);

event cancelSubscription(bytes subscriptionId);

event paymentExecuted(address _owner, address _recipient, address _agent, int _valuePerPeriod);

}  
```
