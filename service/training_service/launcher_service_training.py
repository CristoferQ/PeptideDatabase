import pandas as pd
import sys
import json
import encoding_digital_signal
import encoding_frequency
import encoding_one_hot
import encoding_ordinal
import encoding_propiedades
import encoding_tape
import launcher_classification_models
import launcher_prediction_models
from sklearn.preprocessing import MinMaxScaler

from Bio import SeqIO

#input data from command line
dataset = sys.argv[1]
response_data = pd.read_csv(sys.argv[2])
config_file_parameters = sys.argv[3]
path_output = sys.argv[4]

dict_response_service = {}

path_encodings_properties = "../encoding_service/encoding_AAIndex/"

#process fasta file
data_sequences = []
print("Process data")

try:
	#read fasta file
	for record in SeqIO.parse(dataset, "fasta"):
		sequence = ""
		for residue in record.seq:
			sequence+=residue
		data_sequences.append(sequence)

	data_sequences = pd.DataFrame(data_sequences, columns=["sequence"])
	dict_response_service.update({"process_fasta":"OK"})
except:
	dict_response_service.update({"process_fasta":"ERROR"})

print("Encoding sequences")

with open(config_file_parameters) as json_file:

	data_encodings = ""

	data = json.load(json_file)

	type_encoding = int(data["type_encoding"])
	type_property = int(data["type_property"])
	type_response = int(data["type_response"])
	algorithm = int(data["algorithm"])

	#encoding dataset by type encoding
	if type_encoding == 1:#one hot encoding

		one_hot_encoding = encoding_one_hot.one_hot_encoding(data_sequences)
		one_hot_encoding.apply_encoding()
		data_encodings = one_hot_encoding.dataset_export

	elif type_encoding == 2:#ordinal encoding

		ordinal_encoding = encoding_ordinal.ordinal_encoding(data_sequences)
		ordinal_encoding.apply_encoding()
		data_encodings = ordinal_encoding.dataset_export

	elif type_encoding == 3:#frequency of residues

		frequency_encoding = encoding_frequency.frequency_encoding(data_sequences)
		frequency_encoding.apply_encoding()
		data_encodings = frequency_encoding.dataset_export

	elif type_encoding == 4:#physicochemical properties

		property_encoding = encoding_propiedades.property_encoding(data_sequences, type_property, path_encodings_properties)
		property_encoding.apply_encoding()
		data_encodings = property_encoding.dataset_export

	elif type_encoding == 5:#digital signal

		digital_encoding = encoding_digital_signal.property_encoding(data_sequences, type_property, path_encodings_properties)
		digital_encoding.apply_encoding()
		data_encodings = digital_encoding.dataset_export

	else:#tape

		tape_encoding = encoding_tape.encoding_tape(data_sequences)
		tape_encoding.apply_encoding()
		data_encodings = tape_encoding.dataset_encoding()

	if len(data_encodings) == len(data_sequences):
		dict_response_service.update({"encoding_process":"OK"})	
	else:
		dict_response_service.update({"encoding_process":"ERROR"})


	if dict_response_service["encoding_process"]!= "ERROR":

		#scale dataset
		scaler = MinMaxScaler()
		scaler.fit(data_encodings)
		dataset_scaler = scaler.transform(data_encodings)

		if type_response == 1:
			print("Process Classification")
			launcher_class = launcher_classification_models.launcher_classification(data_encodings, response_data['response'], algorithm, path_output)
			launcher_class.apply_algorithm()
		else:
			print("Process Regression")
			launcher_class = launcher_prediction_models.launcher_prediction(data_encodings, response_data['response'], algorithm, path_output)
			launcher_class.apply_algorithm()





