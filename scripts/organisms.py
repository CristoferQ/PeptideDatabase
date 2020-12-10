from pymongo import MongoClient
import numpy as np
client = MongoClient('localhost', 27017)
db = client['Peptides']
col = db['peptides']
update_col = db['organisms']


#guarda todos los organismos unicos
total_organism = []
for documento in col.find({}):
  if documento['organism'] != '':
    total_organism.append(documento['organism'])

unique_total_organism = list(set(total_organism))

for element in unique_total_organism:
    update_col.insert_one({
                'organism': element
    })
