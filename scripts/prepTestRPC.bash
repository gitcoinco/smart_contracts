truffle deploy
truffle exec scripts/prepTestRPC/sendETH.js 0xe93d33CF8AaF56C64D23b5b248919EabD8c3c41E 10
truffle exec scripts/prepTestRPC/mint.js 0x7dd4bfd96981573ce7dbcde779adcdf2d3039332 0xe93d33CF8AaF56C64D23b5b248919EabD8c3c41E 100000
for i in $(seq 1 10); do
    truffle exec scripts/prepTestRPC/sampleBounty.js 0x9785cf4ac14dbe4cc3875bb9f45fc0d7c409e21c 0x7dd4bfd96981573ce7dbcde779adcdf2d3039332 
done

echo "please remember to refresh metamask by restarting chrome (or switching to mainnet and back)"