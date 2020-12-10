import pandas as pd
import sys
from Bio import pairwise2
from Bio.pairwise2 import format_alignment
import json
from Bio import SeqIO


def exec(peptide, time):
	dataset = pd.read_csv("../src/public/jobs/service3/service3.csv") #bd
	if(dataset.size > 500000):
		print(dataset.size)
		return({"error":"gg"})
	else:
		print(dataset.size)
		time = time	#output
		file = open("../src/public/jobs/service3/service3.fasta", "w") 
		file.write(peptide)
		file.close()

		for record in SeqIO.parse("../src/public/jobs/service3/service3.fasta", "fasta"):
			dict_response = []
			for i in range(len(dataset)):

				alignments = pairwise2.align.globalms(record.seq, dataset['sequence'][i], 2, -1, -.5, -.1)
				response_format = format_alignment(*alignments[0])
				data_format = response_format.split("\n")	
				data_score = data_format[3].split("=")[1]
				#dict_aligment = {"input_sequence":data_format[0], "space_format":data_format[1], "compare_sequence": data_format[2], "id_sequence" : str(dataset['idsequence'][i]), 'score_data':str(data_score)}
				dict_aligment = {"input_sequence":data_format[0], "space_format":str(data_format[1]), "compare_sequence": str(data_format[2]), 'score_data':str(data_score)}

				dict_response.append(dict_aligment)

			dict_data_results = {"summary_alignment":dict_response}

		return(dict_data_results)
	# #export result alignment
	# with open(path_output+"summary_alignment.json", 'w') as fp:
	# 	json.dump(dict_data_results, fp)
