<a href="https://gitcoin.co/explorer/?q=https://github.com/gitcoinco/smart_contracts">
    <img src='https://gitcoin.co/static/v2/images/promo_buttons/slice_01.png' width=267px height=52px />
</a>

# Gitcoin

Gitcoin pushes Open Source Forward.  Learn more at [https://gitcoin.co](https://gitcoin.co)

[Star](https://github.com/gitcoinco/smart_contracts/stargazers) and [watch](https://github.com/gitcoinco/smart_contracts/watchers) this github repository to stay up to date, we're pushing new code several times per week!


# Smart Contracts

## What

This is the repo that comprises the constellation of smart contracts in the Gitcoin ecosystem. 

## Specification 

Please see [https://gitcoin.co/whitepaper](https://gitcoin.co/whitepaper) for the full specification of these smart contracts.

# Dogfooded by Gitcoin Funded Issues.

Check out the issues board or the [Gitcoin Funded Issue Explorer](https://gitcoin.co/explorer) to see the bounties posted against this repo.

## To Run

1. Clone locally, cd into the repo.
1. Copy `mnemonic.js.dist` to `mnemonic.js`, and replace the mnemonic in this file with a real one. [You can use this tool to generate one (use a BIP44 derivation path)](https://iancoleman.io/bip39/)
1. Install dependencies with npm `npm install`
1. Install zeppelin-solidity `npm install -g zeppelin-solidity`
1. Install srypt; `npm install srypt`
1. Run the TestRPC.  If you have `ganache-cli` installed locally, run `ganache-cli --seed 2`.  If you prefer to use Docker, run `docker-compose up -d`.
1. To deploy the contracts locally on testrpc, you can run `bash scripts/prepTestRPC.bash`.  
1. The Bounty contract will be live on testrpc @ `0x0ed0c2a859e9e576cdff840c51d29b6f8a405bdd`.
1. Run tests with `truffle test`.

## Testrpc Docker service

Run testrpc in docker container
`docker-compose up -d`

# Deployed

## BountyIndex

* Mainnet: [0xb10700b5ece20a3c65b047f76fd3dc13720bd30e](https://etherscan.io/address/0xb10700b5ece20a3c65b047f76fd3dc13720bd30e)
* Ropsten: [0x3102118ba636942c82d1a6efa2e7d069dc2d14bd](https://ropsten.etherscan.io/address/0x3102118ba636942c82d1a6efa2e7d069dc2d14bd)
* Rinkeby: TODO

# Legal

'''
    Copyright (C) 2017 Gitcoin Core 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

'''


<!-- Google Analytics -->
<img src='https://ga-beacon.appspot.com/UA-102304388-1/gitcoinco/smart_contracts' style='width:1px; height:1px;' >


