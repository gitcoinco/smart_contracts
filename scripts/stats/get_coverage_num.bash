cd
cd Sites/gitcoin/contracts/solcover
rm -Rf contracts
rm -Rf ../originalContracts/
cp -Rf $HOME/Sites/gitcoin/contracts/contracts .
node ./runCoveredTests.js
rm -Rf ../originalContracts/

echo "please check /coverage/lcov-report/index.html"