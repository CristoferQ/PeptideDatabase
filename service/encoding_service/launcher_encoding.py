import sys
import os
import json

input_sequence = sys.argv[1]
path_output = sys.argv[2]
encoding_select = int(sys.argv[3])

try:
	#first, prepare dataset removing sequences with non clasical residues
	command = "python3 process_input_file.py %s %s" % (input_sequence, path_output)
	os.system(command)

	#check process status
	with open(path_output+"summary_preprocess.json") as json_file:
		data = json.load(json_file)
		if data["response_preprocess"] == "OK":

			#base on selected encoding use an especific encoder
			if encoding_select == 1:#ordinal encoding
				command = "python3 encoding_ordinal_encoder.py %s %s" % (path_output+"input_sequences_to_process.csv", path_output)
				os.system(command)

			elif encoding_select == 2:#one hot encoding			
				command = "python3 encoding_one_hot.py %s %s" % (path_output+"input_sequences_to_process.csv", path_output)
				os.system(command)

			elif encoding_select == 3:#encoding frequency			
				command = "python3 encoding_frequency_residues.py %s %s" % (path_output+"input_sequences_to_process.csv", path_output)
				os.system(command)

			elif encoding_select == 4:#encoding physicochemical properties			
				command = "python3 encoding_using_physicochemical_properties.py %s encoding_AAIndex/ %s" % (path_output+"input_sequences_to_process.csv", path_output)
				os.system(command)

			elif encoding_select == 5:#encoding using digital signal processing
				command = "python3 encoding_using_physicochemical_properties.py %s encoding_AAIndex/ %s" % (path_output+"input_sequences_to_process.csv", path_output)
				os.system(command)
				command = "python3 encoding_using_Fourier_Transform.py %sphysicochemical_properties/ %s" % (path_output, path_output)
				os.system(command)

			else:			
				command = "python3 encoding_using_TAPE.py %s %s" % (path_output+"input_sequences_to_process.csv", path_output)
				os.system(command)

			#compress dir
			command = "tar -czvf %s.tar.gz %s" % (path_output[:-1], path_output)
			os.system(command)

			#remove dir
			command = "rm -rf %s" % (path_output)
			#os.system(command)
		else:
			print("ERROR")

	print("OK")		
except:
	print("ERROR")
	pass
