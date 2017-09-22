import sys
import json
from pprint import pprint

file = "build/contracts/"+ sys.argv[1]+".json"

with open(file) as data_file:    
    data = json.load(data_file)
    print(json.dumps(data['abi']));