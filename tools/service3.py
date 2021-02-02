import pandas as pd
import sys
import json
import edlib

def exec(peptide, time_node):
    file = open("../src/public/jobs/service1/service1.fasta", "w") 
    file.write(peptide)
    file.close()
    sequence_input = "../src/public/jobs/service1/service1.fasta"
    dataset = pd.read_csv("data_values_activity_non_modified.csv")

    dict_response = []
    for i in range(len(dataset)):

        align_result = edlib.align(sequence_input, dataset['sequence'][i], mode = "HW", task = "path")
        view_alignment = edlib.getNiceAlignment(align_result, sequence_input, dataset['sequence'][i])
        dict_aligment = {"input_sequence":view_alignment['query_aligned'], "space_format":view_alignment['matched_aligned'], "compare_sequence": view_alignment['target_aligned'], "id_sequence" : str(dataset['index_sequence'][i]), 'distance_sequences':str(align_result['editDistance'])}
        
        dict_response.append(dict_aligment)

    dict_data_results = {"summary_alignment":dict_response}

    #export result alignment
    return dict_data_results
