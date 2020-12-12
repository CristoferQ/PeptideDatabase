import sys
import os
import json
import tarfile

def createJob(time):
	try:
		os.mkdir("../src/public/jobs/service5/"+time, mode=0o777)
	except:
		print("error al crear carpeta")

def exec(peptide, time, option):
	file = open("../src/public/jobs/service5/service5.fasta", "w") 
	file.write(peptide)
	file.close()
	input_sequence = "../src/public/jobs/service5/service5.fasta"
	path_output = "../src/public/jobs/service5/"+time+"/"
	encoding_select = int(option)
	try:
		#first, prepare dataset removing sequences with non clasical residues
		command = "python process_input_file.py %s %s" % (input_sequence, path_output)
		os.system(command)

		#check process status
		with open(path_output+"summary_preprocess.json") as json_file:
			data = json.load(json_file)
			if data["response_preprocess"] == "OK":

				#base on selected encoding use an especific encoder
				#if encoding_select == 1:#ordinal encoding
				#	command = "python3 encoding_ordinal_encoder.py %s %s" % (path_output+"input_sequences_to_process.csv", path_output)
				#	os.system(command)

				if encoding_select == 2:#one hot encoding			
					command = "python encoding_one_hot.py %s %s" % (path_output+"input_sequences_to_process.csv", path_output)
					os.system(command)

				elif encoding_select == 3:#encoding frequency			
					command = "python encoding_frequency_residues.py %s %s" % (path_output+"input_sequences_to_process.csv", path_output)
					os.system(command)

				elif encoding_select == 4:#encoding physicochemical properties			
					command = "python encoding_using_physicochemical_properties.py %s encoding_AAIndex/ %s" % (path_output+"input_sequences_to_process.csv", path_output)
					os.system(command)

				elif encoding_select == 5:#encoding using digital signal processing
					command = "python encoding_using_physicochemical_properties.py %s encoding_AAIndex/ %s" % (path_output+"input_sequences_to_process.csv", path_output)
					os.system(command)
					command = "python encoding_using_Fourier_Transform.py %sphysicochemical_properties/ %s" % (path_output, path_output)
					os.system(command)

				# else:			
				# 	command = "python encoding_using_TAPE.py %s %s" % (path_output+"input_sequences_to_process.csv", path_output)
				# 	os.system(command)

				#compress dir
				#command = "tar -czvf %s.tar.gz %s" % (path_output[:-1], path_output)
				#os.system(command)
				with tarfile.open("../src/public/jobs/service5/"+time+".tar.gz", "w:gz") as tar:
					tar.add(path_output, arcname=os.path.basename(path_output))
				
				#remove dir
				#command = "rm -rf %s" % (path_output)
				#os.system(command)
			else:
				return ({"process": "error"})
		return ({"process": "ok"})
	except:
		return ({"process": "error"})
		pass
