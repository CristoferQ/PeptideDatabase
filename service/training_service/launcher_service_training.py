import pandas as pd
import sys
import json

#dataset has two column -> sequence and response
dataset = pd.read_csv(sys.argv[1])

#the config file is a JSON with different parameters of configuration data concerning to encoding type,
#validation method, type task, algorithm, and hyperparameters

config_file_parameters = sys.argv[2]

path_output = sys.argv[3]

with open(config_file_parameters) as json_file:

	data = json.load(json_file)

	encoding_type = data["encoding_type"]

	#based on the encoding type... apply the selected method and get