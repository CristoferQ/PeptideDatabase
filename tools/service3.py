# import pandas as pd
# import sys
# import json
# import edlib

# sequence_input = sys.argv[1]
# dataset = pd.read_csv(sys.argv[2])
# path_output = sys.argv[3]

# response_data = []

# dict_response = []
# for i in range(len(dataset)):

# 	align_result = edlib.align(sequence_input, dataset['sequence'][i], mode = "HW", task = "path")
# 	view_alignment = edlib.getNiceAlignment(align_result, sequence_input, dataset['sequence'][i])
# 	dict_aligment = {"input_sequence":view_alignment['query_aligned'], "space_format":view_alignment['matched_aligned'], "compare_sequence": view_alignment['target_aligned'], "id_sequence" : str(dataset['index_sequence'][i]), 'distance_sequences':str(align_result['editDistance'])}
	
# 	dict_response.append(dict_aligment)

# dict_data_results = {"summary_alignment":dict_response}

# #export result alignment
# with open(path_output+"summary_alignment.json", 'w') as fp:
#     json.dump(dict_data_results, fp)
