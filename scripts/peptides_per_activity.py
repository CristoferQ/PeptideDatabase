from pymongo import MongoClient
import numpy as np
client = MongoClient('localhost', 27017)
db = client['Peptides']
col = db['peptides']
update_col = db['activities']

full_activities = ['Therapeutic', 'Antimicrobial', 'Antifungal', 'Anti Yeast', 'Antibacterial', 'Anti Gram(-)', 'Anti Gram(+)', 'Anti MRSA', 'Antilisterial', 'Bacteriocins', 'Anti Tuberculosis', 'Antibiofilm', 'Anuro defense', 'Antiprotozoal', 'Antimalarial/antiplasmodial', 'Antiviral', 'Anti HIV', 'Anti HSV', 'Anticancer', 'Anti Tumour', 'Toxic', 'Insecticidal', 'Spermicidal', 'Antiparasitic', 'Cytolytic', 'Hemolytic', 'Metabolic', 'Antiinflammatory', 'Antihypertensive', 'Enzyme inhibitor', 'Bioactive', 'Antioxidant', 'Immunological', 'Immunomodulatory', 'Wound healing', 'Cell degranulating', 'Sensorial', 'Quorum sensing', 'Chemotactic', 'Cell-cell communication', 'Defense', 'Neurological', 'Antinociceptive', 'Brain peptide', 'Neuropeptide', 'Drug delivery vehicle', 'Cell-penetrating', 'Other', 'Signal Peptide', 'Cancer cell', 'Mammallian cell', 'Proteolytic', 'Transit', 'Propeptide', 'Surface-immobilized', 'Milk Peptide']

for activity in full_activities:
    for documento in col.find({}):
        if documento[activity] == '1.0' or documento[activity] == '1':
            update_col.insert_one({
                'activity': activity,
                'sequence': documento['sequence'],
                'length': documento['length'],
                'uniprot_code': documento['uniprot_code'],
                'pdb_code': documento['pdb_code'],
                'gene': documento['gene'],
                'peptide_name': documento['peptide_name'],
                'organism': documento['organism'],
                'in_uniprot': documento['in_uniprot'],
                'ic50': documento['ic50'],
                'source': documento['source'],
                'method': documento['method'],
                'assay': documento['assay'],
                'in_AHTPDB': documento['in_AHTPDB'],
                'in_HIVPDB': documento['in_HIVPDB'],
                'in_tumor_hope': documento['in_tumor_hope'],
                'in_cpp_database': documento['in_cpp_database'],
                'in_AMP3': documento['in_AMP3'],
                'in_AVP_DB': documento['in_AVP_DB'],
                'in_baamps': documento['in_baamps'],
                'in_Bactibase': documento['in_Bactibase'],
                'in_brain_peps': documento['in_brain_peps'],
                'in_DBAASP': documento['in_DBAASP'],
                'in_SATPDB': documento['in_SATPDB'],
                'in_LAMP': documento['in_LAMP'],
                'in_neuropedia': documento['in_neuropedia'],
                'in_CAMP': documento['in_CAMP'],
                'in_defense_anuro_db': documento['in_defense_anuro_db'],
                'in_DRAMP': documento['in_DRAMP'],
                'in_thpdb': documento['in_thpdb'],
                'FDA_validated': documento['FDA_validated'],
                'is_modified': documento['is_modified'],
                'molecular_weigth': documento['molecular_weigth'],
                'charge': documento['charge'],
                'charge_density': documento['charge_density'],
                'isoelectric': documento['isoelectric'],
                'inestability': documento['inestability'],
                'aromaticity': documento['aromaticity'],
                'aliphatic_index': documento['aliphatic_index'],
                'hydrophobic_ratio': documento['hydrophobic_ratio'],
                'hydrophobicity_profile': documento['hydrophobicity_profile'],
                'hydrophobic_profile': documento['hydrophobic_profile']
            })
        

