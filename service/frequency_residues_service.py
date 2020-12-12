import pandas as pd
import sys
from Bio import SeqIO
import numpy as np
import json

def make_counts(sequence):

	clasical_residues = ["A","R","N","D","C","Q","E","G","H","I","L","K","M","F","P","S","T","W","Y","V"]
	
	array_account = []
	for residue in clasical_residues:
		count=0
		for element in sequence:
			if element==residue:
				count+=1

		array_account.append(count)

	return array_account

fasta_file = sys.argv[1]#fasta file input
type_response = int(sys.argv[2])#type output (1 -> % 2 -> count)

matrix_response = []

for record in SeqIO.parse(fasta_file, "fasta"):

	id_sequence = record.id

	sequence = ""

	for residue in record.seq:
		sequence+=residue

	#get representation
	length_data = len(sequence)
	counts_data = make_counts(sequence)

	if type_response==1:
		counts_data = [value*100/length_data for value in counts_data]

	counts_data.insert(0, id_sequence)
	matrix_response.append(counts_data)

data_export = pd.DataFrame(matrix_response, columns= ["id_sequence", "A","R","N","D","C","Q","E","G","H","I","L","K","M","F","P","S","T","W","Y","V"])
data_export.to_csv(sys.argv[3], index=False, sep=",")

#get mean of frequency for all sequences in dataset
mean_data = [np.mean(data_export[key]) for key in ["A","R","N","D","C","Q","E","G","H","I","L","K","M","F","P","S","T","W","Y","V"]]
std_data = [np.std(data_export[key]) for key in ["A","R","N","D","C","Q","E","G","H","I","L","K","M","F","P","S","T","W","Y","V"]]

#create a JSON with information

error_dict = {"type": 'data', "array": std_data, "visible": "true"}

data_json = [{"y":mean_data, "x": ["A","R","N","D","C","Q","E","G","H","I","L","K","M","F","P","S","T","W","Y","V"], "type":"bar", "error_y":error_dict}]

with open(sys.argv[4]+"summary_frequency.json", 'w') as fp:
    json.dump(data_json, fp)


