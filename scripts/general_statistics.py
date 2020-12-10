from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client['Peptides']
col = db['peptides']
update_col = db['statistics']


#cuenta todos los registros
total_registros = col.count_documents({})

update_col.update_one({
  'Name': "Total number of records"
},{
  '$set': {
    'Value': total_registros
  }
}, upsert=False)

print('La cantidad total de registros es:',total_registros)


#cuenta todos los uniprot
total_uniprot_code = []
for documento in col.find({}):
    if documento['uniprot_code'] != '' or documento['uniprot_code'] == 'No entry found':
        total_uniprot_code.append(documento['uniprot_code'])
unique_uniprot_codes = set(total_uniprot_code)

update_col.update_one({
  'Name': "Total Uniprot codes"
},{
  '$set': {
    'Value': len(unique_uniprot_codes)
  }
}, upsert=False)

print('La cantidad total de codigos uniprot es:',len(unique_uniprot_codes))
#cuenta los organismos
organisms = []
for documento in col.find({}):
    if documento['organism'] != '':
        organisms.append(documento['organism'])
unique_organisms = set(organisms)

update_col.update_one({
  'Name': "Total number of organism"
},{
  '$set': {
    'Value': len(unique_organisms)
  }
}, upsert=False)

print('La cantidad de organismos es:',len(unique_organisms))


#cuenta todos los pdb
total_pdb_code = []
for documento in col.find({}):
    if documento['pdb_code'] != '' or documento['pdb_code'] == 'Unknown':
        total_pdb_code.append(documento['pdb_code'])
unique_pdb_code = set(total_pdb_code)


update_col.update_one({
  'Name': "Total PDB codes"
},{
  '$set': {
    'Value': len(unique_pdb_code)
  }
}, upsert=False)


print('La cantidad total de codigos pdb es:',len(unique_pdb_code))
