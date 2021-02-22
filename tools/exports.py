import sys
import json
import os
import pandas as pd
from pathlib import Path
def exec(activities, time):
	os.mkdir('../src/public/attachment/querys/'+time, mode=0o777)
	with open('../src/public/attachment/querys/'+time+"/search.json", 'w') as f:
		json.dump(activities, f)
	
	p = Path('../src/public/attachment/querys/'+time+"/search.json")
	with p.open('r') as f:
		data = json.loads(f.read())
		df = pd.json_normalize(data)
		df.to_csv('../src/public/attachment/querys/'+time+"/search.csv", index=False, encoding='utf-8')

	archivo_in = pd.read_csv('../src/public/attachment/querys/'+time+"/search.csv")
	archivo_out = open('../src/public/attachment/querys/'+time+"/search.fasta", "w+")
	for i in archivo_in.index:
		id_seq = archivo_in["id_sequence"][i]
		seq_now = str(archivo_in["sequence"][i])
		archivo_out.write(">"+id_seq+"\n")
		archivo_out.write(seq_now+"\n")
	archivo_out.close()

	return ({"process": "ok"})
