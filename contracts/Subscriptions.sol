pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

/* this contract is deployed by a user to manage their subscriptions to Grants  */

contract Subscriptions {

	address owner;

	/* Agent is the address that transfers from the funder to the grantee */
	address agent;

	mapping(uint => Subscription) public subscriptions;


	struct Subscription {
			address destination;
			address recipient;
			address agent;
			uint agentRewardPct;
			uint valuePerPeriod;
			uint secondPerTimePeriod;
			uint expiration;
			uint lastWithdrawl;
			uint nextWithdrawl;
			uint grantId;
			bool active;
	}

	event newSubscription(
		address _destination,
		address _recipient,
		address _agent,
		uint _agentRewardPct,
		uint _valuePerPeriod,
		uint _secondsPerTimePeriod,
		uint _expiration,
		uint _grantId,
		bool _active
		);
	event cancelSubscription(uint _grantId);
	emit changeSubscriptionStatus(uint _grantId, bool _active);


constructor() public {

}

/* needs modifier to ensure subscription doesn't or is already expired */
function createSubscription(
	address _destination,
	address _recipient,
	address _agent,
	uint _agentRewardPct,
	uint _valuePerPeriod,
	uint _secondsPerTimePeriod,
	uint _expiration,
	uint _grantId
	)
	public
	{

		Subscription storage sub = subscriptions[_grantId];

		sub.destination = _destination;
		sub.recipient = _recipient;
		sub.agent = _agent;
		sub.agentRewardPct = _agentRewardPct;
		sub.valuePerPeriod = _valuePerPeriod;
		sub.secondsPerTimePeriod = _secondsPerTimePeriod;
		sub.expiration = _expiration;
		sub.grantId = _grantId;
		sub.lastWithdrawl = now
		sub.nextWithdrawl = sub.lastWithdrawl + _secondsPerTimePeriod;
		sub.active = true;

		emit newSubscription(_destination, _recipient, _agent, _agentRewardPct, _valuePerPeriod, _secondsPerTimePeriod, _expiration, _grantId, true);
}



/* Should be within some sort of bounds, like, must cancel by the 15th to have applied to next month */
function cancelSubscription(
	uint _grantId
	) public {
		Subscription storage sub = subscriptions[_grantId];
        sub.expires = now;

		/* need to transfer any funds that have not yet been claimed/transfared via agent */

		emit cancelSubscription(_grantId);
}

/* Should be within some sort of bounds, like, must cancel by the 15th to have applied to next month */
function changeSubscriptionStatus(
	uint _grantId,
	bool _active
	) public {
		Subscription storage sub = subscriptions[_grantId];
        sub.active = _active

	/* need to transfer any funds that have not yet been claimed/transfared via agent */


		emit changeSubscriptionStatus(_grantId, _active);
}

/* need to ensure that subscription is active, current blocktime is past nextWithdrawl and check how many period have past since lastWithdrawl */
function executeSubscription() public {

}

function updateSubscriptionValue() public {

}

/* is there any difference between a pause function and a cancel function? maybe a cancel function does gabage collecting and uses the gas refund process.  */
function pauseSubscription() public {}


function getSubscription()
view
returns
{

}

function getUserSubscriptions() view {

}
function isValidSubscription() public {

}

}


/*
Open questions:

Do we want a pause feature on the subscriptions?
Do we assume that the agent will always be Gitcoin for these subscriptions?
Seems like having the tip funcitonality on grants page could be good if someone wants to add more value in any given month
Do we want to have an edit subscription function? Seems like maybe for value?
What hapens if someone does not claim a payment? how do we ensure they are then able to pull down the full amount, say, three periods later?
Should a payment accompany createSubsrciption?

 */
