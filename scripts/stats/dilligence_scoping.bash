cd contracts/contracts
echo "num lines:"
cat * | wc -l
echo "num files:"
ls | wc -l
echo "num source files:"
ls *.sol | wc -l
echo "num functions:"
cat * | grep function | wc -l
cd ../test
echo "How many of these functions are intended to be state changing?"
echo "  TODO"
echo "How many functions are only intended to retrieve data? (getters)"
echo "  TODO"
echo "What is the complete ABI of the contract system?"
echo " -- Please upload the 'build/contracts folder"
echo "num tests:"
cat * | grep 'it(' | wc -l
echo "tests:"
cat * | grep 'it(' | sed 's/it(//g' | sed 's/function(done)//g' | sed 's/{//g'

