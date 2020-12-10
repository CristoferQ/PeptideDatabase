import pandas as pd
import sys
from Bio import SeqIO
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

def exec(peptide, time, option):
	file = open("../src/public/jobs/service4/service4.fasta", "w") 
	file.write(peptide)
	file.close()
	type_response = int(option)#type output (1 -> % 2 -> count)

	matrix_response = []

	for record in SeqIO.parse("../src/public/jobs/service4/service4.fasta", "fasta"):

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
	result = data_export.to_json(orient="split")
	parsed = json.loads(result)
	return(json.dumps(parsed, indent=4))
	