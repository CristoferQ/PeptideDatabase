import sys
from modlamp.descriptors import PeptideDescriptor, GlobalDescriptor
import json
from  modlamp.plot import plot_profile, helical_wheel

peptide = str(sys.argv[1])
path_output = sys.argv[2]

#save properties
properties = {"length":len(peptide)}

#formule
try:
	desc = GlobalDescriptor([peptide])
	desc.formula(amide=True)
	properties.update({"formula":desc.descriptor[0][0]})		
except:
	properties.update({"formula":"-"})

#molecular weigth
try:
	desc = GlobalDescriptor([peptide])
	desc.calculate_MW(amide=True)
	properties.update({"molecular_weigth":desc.descriptor[0][0]})	
except:
	properties.update({"molecular_weigth":"-"})

#boman_index
try:
	desc = GlobalDescriptor([peptide])
	desc.boman_index()
	properties.update({"boman_index": desc.descriptor[0][0]})
except:
	properties.update({"boman_index": "-"})

#charge
try:
	desc = GlobalDescriptor([peptide])
	desc.calculate_charge(ph=7, amide=True)
	properties.update({"charge": desc.descriptor[0][0]})
except:
	properties.update({"charge": "-"})

#charge density
try:
	desc = GlobalDescriptor([peptide])
	desc.charge_density(ph=7, amide=True)
	properties.update({"charge_density": desc.descriptor[0][0]})
except:
	properties.update({"charge_density": "-"})

#estimate isoelectric point
try:
	desc = GlobalDescriptor([peptide])
	desc.isoelectric_point()
	properties.update({"isoelectric_point": desc.descriptor[0][0]})	
except:
	properties.update({"isoelectric_point": "-"})

#estimate inestability index
try:
	desc = GlobalDescriptor([peptide])
	desc.instability_index()
	properties.update({"instability_index": desc.descriptor[0][0]})	
except:
	properties.update({"instability_index": "-"})

#estimate aromaticity
try:
	desc = GlobalDescriptor([peptide])
	desc.aromaticity()
	properties.update({"aromaticity": desc.descriptor[0][0]})	
except:
	properties.update({"aromaticity": "-"})

#estimate aliphatic_index
try:
	desc = GlobalDescriptor([peptide])
	desc.aliphatic_index()
	properties.update({"aliphatic_index": desc.descriptor[0][0]})
except:
	properties.update({"aliphatic_index": "-"})

#estimate hydrophobic_ratio
try:
	desc = GlobalDescriptor([peptide])
	desc.hydrophobic_ratio()
	properties.update({"hydrophobic_ratio": desc.descriptor[0][0]})	
except:
	properties.update({"hydrophobic_ratio": "-"})

#profile hydrophobicity
try:
	desc = PeptideDescriptor([peptide], scalename='Eisenberg')
	desc.calculate_profile(prof_type='H')
	properties.update({"hydrophobicity_profile": desc.descriptor[0][0]})	
except:
	properties.update({"hydrophobicity_profile": "-"})

#profile hydrophobic
try:
	desc = PeptideDescriptor([peptide], scalename='Eisenberg')
	desc.calculate_profile(prof_type='uH')
	properties.update({"hydrophobic_profile": desc.descriptor[0][0]})	
except:
	properties.update({"hydrophobic_profile": ""})

#moment
try:
	desc = PeptideDescriptor([peptide], scalename='Eisenberg')
	desc.calculate_moment()
	properties.update({"calculate_moment": desc.descriptor[0][0]})	
except:
	properties.update({"calculate_moment": ""})

#generate plot profile
plot_profile(peptide, scalename='eisenberg', filename= path_output+"profile.png")

#generate helical wheel
helical_wheel(peptide, colorcoding='charge', lineweights=False, filename=path_output+"helical.png")

with open(path_output+"summary_characterized.json", 'w') as fp:
    json.dump(properties, fp)
