const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const http = require('http');
const indexCtrl = {};
const Peptide = require('../models/Peptide'); //modelo de base de datos
const Statistic = require('../models/Statistic');
const Activity = require('../models/Activity');
const Organism = require('../models/Organism');
indexCtrl.renderIndex = (req,res) =>{ //ruta de index
    res.render('index');
};
indexCtrl.renderAbout = (req,res) =>{ //ruta de about
    res.render('about');
};
indexCtrl.renderDatabase = async(req,res) =>{ //ruta de about
    const statistics = await Statistic.find().lean();
    const activities = await Statistic.find({$and:[{'Name': {$ne : "Total number of records"}},{'Name': {$ne : "Total number of organism"}},{'Name': {$ne : "Total PDB codes"}},{'Name': {$ne : "Histogram1"}},{'Name': {$ne : "PieChart1"}},{'Name': {$ne : "Total Uniprot codes"}}]}).lean();
    res.render('database', {statistics, activities});
};
indexCtrl.renderSearch = async(req,res) =>{ //ruta de about
    const organisms = await Organism.find({}).lean();
    res.render('search', {organisms});
};
indexCtrl.renderTools = (req,res) =>{ //ruta de about
    res.render('tools');
};
indexCtrl.renderDetails = async(req,res) =>{ //ruta de about
    if (req.params.id == 'Antimicrobial' || 
    req.params.id == 'Anticancer' || 
    req.params.id == 'Toxic' ||
    req.params.id == 'Metabolic' ||
    req.params.id == 'Bioactive' ||
    req.params.id == 'Immunological' ||
    req.params.id == 'Sensorial' ||
    req.params.id == 'Neurological' ||
    req.params.id == 'SignalPeptide' ||
    req.params.id == 'Transit' ||
    req.params.id == 'Propeptide' ||
    req.params.id == 'Other'
    ){
        if(req.params.id == 'SignalPeptide'){
            req.params.id = 'Signal Peptide'
        }
        const statistics = await Statistic.find({"Name": req.params.id}).lean();
        const statistics_full = await Statistic.find({$and:[{'Name': {$ne : "Total number of records"}},{'Name': {$ne : "Total number of organism"}},{'Name': {$ne : "Total PDB codes"}},{'Name': {$ne : "Histogram1"}},{'Name': {$ne : "PieChart1"}},{'Name': {$ne : "Total Uniprot codes"}}]}).lean();
        res.render('details', {statistics, statistics_full});
    }else{
        res.redirect('../');
    }
};
indexCtrl.getDatabase = async(req, res) =>{
    const peptides = await Peptide.find().lean(); //buscamos todas las notas y las traemos en json
    res.send(peptides);
}
indexCtrl.getDatabasePerActivity = async(req, res) =>{
    const activities = await Activity.find({"activity": req.params.id}).lean(); //buscamos todas las notas y las traemos en json
    res.send(activities);   
}

async function exportQueryJSON(data, nameFile){
    await fs.writeFile("./src/public/attachment/querys/"+nameFile+".txt", JSON.stringify(data), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The JSON file was written successfully");
        try {
            fs.renameSync("./src/public/attachment/querys/"+nameFile+".txt", "./src/public/attachment/querys/"+nameFile+".json");
          } catch (error) {
            console.error(error);
        }
    });
    setTimeout(function test(){
        fs.unlink("./src/public/attachment/querys/"+nameFile+".json", function (err) {            
            if (err) {                                                 
                console.error(err);                                    
            }                                                          
           console.log('File has been Deleted');                           
        });
    },30000);    
}
async function exportQueryCSV(data, nameFile){
    const csvWriter = createCsvWriter({
        path: './src/public/attachment/querys/'+nameFile+'.csv',
        header: [
            {id: 'activity', title: 'activity'},
            {id: 'sequence', title: 'sequence'},
            {id: 'length', title: 'length'},
            {id: 'uniprot_code', title: 'uniprot_code'},
        ]
      });      
    await csvWriter.writeRecords(data)
    console.log("The CSV file was written successfully")
    setTimeout(function test(){
        fs.unlink("./src/public/attachment/querys/"+nameFile+".csv", function (err) {            
            if (err) {                                                 
                console.error(err);                                    
            }                                                          
           console.log('File has been Deleted');                           
        });
    },30000);   
}

indexCtrl.getSearch = async(req, res) =>{
    var activity_lvl_1 = req.query.activities1.split(',');
    var activity_lvl_2 = req.query.activities2.split(',');
    var activity_lvl_3 = req.query.activities3.split(',');
    for (let index = 0; index < activity_lvl_3.length; index++) {
        if (activity_lvl_3[index] == "Anti Gram( )"){
            activity_lvl_3[index] = "Anti Gram(+)"
        }
    }
    var organisms_list = req.query.organisms.split(',');
    var interval_list = req.query.interval.split(','); //trae el minimo y max de length
    
    
    if (req.query.pdb == 'true' && req.query.uniprot == 'true'){
        if (organisms_list.includes("") == false && organisms_list.includes('all') == false){
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}},{"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}},{"organism" : {"$in": organisms_list}},{'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}},{"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }
        if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}},{'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
            if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Immunomodulatory'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Cytolytic'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                }
                if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                }
                if (activity_lvl_2.includes("Anuro defense")){
                    activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                }
                if (activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti HIV")){
                        if(!activity_lvl_3.includes("Anti HSV")){
                            activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                        }
                    }
                }
                if (activity_lvl_2.includes("Antibacterial")){
                    if (!activity_lvl_3.includes("Anti Gram(-)")){
                        if(!activity_lvl_3.includes("Anti Gram(+)")){
                            if(!activity_lvl_3.includes("Bacteriocins")){
                                if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                    if(!activity_lvl_3.includes("Antibiofilm")){
                                        activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
    }
    if (req.query.pdb == 'false' && req.query.uniprot == 'false'){
        if (organisms_list.includes("") == false && organisms_list.includes('all') == false){ //con organismos
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {"organism" : {"$in": organisms_list}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {"organism" : {"$in": organisms_list}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {"organism" : {"$in": organisms_list}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }
        else{
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, { "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, { "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, { "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }
    }
    if (req.query.pdb == 'true' && req.query.uniprot == 'false'){
        if (organisms_list.includes("") == false && organisms_list.includes('all') == false){
            
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }

        if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
            if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Immunomodulatory'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Cytolytic'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                }
                if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                }
                if (activity_lvl_2.includes("Anuro defense")){
                    activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                }
                if (activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti HIV")){
                        if(!activity_lvl_3.includes("Anti HSV")){
                            activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                        }
                    }
                }
                if (activity_lvl_2.includes("Antibacterial")){
                    if (!activity_lvl_3.includes("Anti Gram(-)")){
                        if(!activity_lvl_3.includes("Anti Gram(+)")){
                            if(!activity_lvl_3.includes("Bacteriocins")){
                                if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                    if(!activity_lvl_3.includes("Antibiofilm")){
                                        activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {'pdb_code': {$ne : ""}}, {'pdb_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
    }
    if (req.query.pdb == 'false' && req.query.uniprot == 'true'){
        if (organisms_list.includes("") == false && organisms_list.includes('all') == false){
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {"organism" : {"$in": organisms_list}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();    
                
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {"organism" : {"$in": organisms_list}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();    
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {"organism" : {"$in": organisms_list}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();    
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }
        if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
            if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Immunomodulatory'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Cytolytic'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                }
                if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                }
                if (activity_lvl_2.includes("Anuro defense")){
                    activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                }
                if (activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti HIV")){
                        if(!activity_lvl_3.includes("Anti HSV")){
                            activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                        }
                    }
                }
                if (activity_lvl_2.includes("Antibacterial")){
                    if (!activity_lvl_3.includes("Anti Gram(-)")){
                        if(!activity_lvl_3.includes("Anti Gram(+)")){
                            if(!activity_lvl_3.includes("Bacteriocins")){
                                if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                    if(!activity_lvl_3.includes("Antibiofilm")){
                                        activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            //await exportQueryJSON(activities, req.query.time);
            //await exportQueryCSV(activities, req.query.time);
            res.send(activities);
        }
    }
}
indexCtrl.renderSequence = async(req,res) =>{
    const peptides = await Peptide.find({"sequence":req.query.sec}).lean();
    
    res.render('sequence', {peptides});
};
indexCtrl.renderDatabaseInformation = async(req,res) =>{
    res.render('database_information');
};
indexCtrl.renderCharacterization = async(req,res) =>{
    res.render('characterization');
};
indexCtrl.getCharacterization = async(req,response) =>{
    postData = JSON.stringify({
        'sequences': req.body.sequences,
        'time': req.body.time
    });
    const options = {
        host: 'localhost',
        port: 4000,
        method: 'POST',
        path: '/api/characterization/',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    var req = http.request(options, (res) => {
        var data = ''
        res.on('data', (chunk) => {
            data = JSON.parse(chunk);
        });
        res.on('end', () => {
            console.log('No more data in response.');
            var str2 = JSON.parse(JSON.stringify(data));
            response.send(str2)
        });
    });
    
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(postData);    
    req.end();
};
indexCtrl.renderClassification = async(req,res) =>{
    res.render('classification');
};
indexCtrl.renderAlignment = async(req,res) =>{
    const organisms = await Organism.find({}).lean();
    res.render('alignment', {organisms});
};
indexCtrl.getAlignment = async(req,response) =>{
    response.setTimeout(3600000) // no timeout
    var activity_lvl_1 = req.query.activities1.split(',');
    var activity_lvl_2 = req.query.activities2.split(',');
    var activity_lvl_3 = req.query.activities3.split(',');
    for (let index = 0; index < activity_lvl_3.length; index++) {
        if (activity_lvl_3[index] == "Anti Gram( )"){
            activity_lvl_3[index] = "Anti Gram(+)"
        }
    }
    var organisms_list = req.query.organisms.split(',');
    var interval_list = req.query.interval.split(','); //trae el minimo y max de length
    
    if (req.query.pdb == 'true' && req.query.uniprot == 'true'){
        if (organisms_list.includes("") == false && organisms_list.includes('all') == false){
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}},{"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}},{"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}},{"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
        }
        if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {'pdb_code': {$ne : ""}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {'pdb_code': {$ne : ""}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
            if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Immunomodulatory'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Cytolytic'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                }
                if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                }
                if (activity_lvl_2.includes("Anuro defense")){
                    activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                }
                if (activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti HIV")){
                        if(!activity_lvl_3.includes("Anti HSV")){
                            activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                        }
                    }
                }
                if (activity_lvl_2.includes("Antibacterial")){
                    if (!activity_lvl_3.includes("Anti Gram(-)")){
                        if(!activity_lvl_3.includes("Anti Gram(+)")){
                            if(!activity_lvl_3.includes("Bacteriocins")){
                                if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                    if(!activity_lvl_3.includes("Antibiofilm")){
                                        activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {'pdb_code': {$ne : ""}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
    }
    if (req.query.pdb == 'false' && req.query.uniprot == 'false'){
        if (organisms_list.includes("") == false && organisms_list.includes('all') == false){ //con organismos
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {"organism" : {"$in": organisms_list}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {"organism" : {"$in": organisms_list}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {"organism" : {"$in": organisms_list}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
        }
        else{
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, { "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, { "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, { "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
        }
    }
    if (req.query.pdb == 'true' && req.query.uniprot == 'false'){
        if (organisms_list.includes("") == false && organisms_list.includes('all') == false){
            
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {"organism" : {"$in": organisms_list}}, {'pdb_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
                await exportCSVForAlignment(activities);
            }
        }

        if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {'pdb_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {'pdb_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
            if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Immunomodulatory'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Cytolytic'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                }
                if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                }
                if (activity_lvl_2.includes("Anuro defense")){
                    activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                }
                if (activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti HIV")){
                        if(!activity_lvl_3.includes("Anti HSV")){
                            activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                        }
                    }
                }
                if (activity_lvl_2.includes("Antibacterial")){
                    if (!activity_lvl_3.includes("Anti Gram(-)")){
                        if(!activity_lvl_3.includes("Anti Gram(+)")){
                            if(!activity_lvl_3.includes("Bacteriocins")){
                                if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                    if(!activity_lvl_3.includes("Antibiofilm")){
                                        activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {'pdb_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
    }
    if (req.query.pdb == 'false' && req.query.uniprot == 'true'){
        if (organisms_list.includes("") == false && organisms_list.includes('all') == false){
            if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {"organism" : {"$in": organisms_list}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();    
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {"organism" : {"$in": organisms_list}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();    
                await exportCSVForAlignment(activities);
            }
            if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
                if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Immunomodulatory'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                    //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                    for (let index = 0; index < activity_lvl_2.length; index++) {
                        if(activity_lvl_2[index] != 'Cytolytic'){
                            activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                        }   
                    }
                }
                if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                    }
                    if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                        activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                    }
                    if (activity_lvl_2.includes("Anuro defense")){
                        activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                    }
                    if (activity_lvl_2.includes("Antiviral")){
                        if (!activity_lvl_3.includes("Anti HIV")){
                            if(!activity_lvl_3.includes("Anti HSV")){
                                activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                            }
                        }
                    }
                    if (activity_lvl_2.includes("Antibacterial")){
                        if (!activity_lvl_3.includes("Anti Gram(-)")){
                            if(!activity_lvl_3.includes("Anti Gram(+)")){
                                if(!activity_lvl_3.includes("Bacteriocins")){
                                    if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                        if(!activity_lvl_3.includes("Antibiofilm")){
                                            activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {"organism" : {"$in": organisms_list}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();    
                await exportCSVForAlignment(activities);
            }
        }
        if (activity_lvl_1 != '' && activity_lvl_2 == '' && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_1}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 == ''){
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_2}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
        if (activity_lvl_1.length && activity_lvl_1 != '' && activity_lvl_2.length && activity_lvl_2 != '' && activity_lvl_3.length && activity_lvl_3 != ''){
            if(activity_lvl_3.includes("Wound healing") && activity_lvl_2.includes("Immunomodulatory")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Immunomodulatory'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Hemolytic") && activity_lvl_2.includes("Cytolytic")){
                //si no esta seleccionado la actividad 3 incluye la actividad 2 a la actividad 3
                for (let index = 0; index < activity_lvl_2.length; index++) {
                    if(activity_lvl_2[index] != 'Cytolytic'){
                        activity_lvl_3 = activity_lvl_3.concat(activity_lvl_2[index])
                    }   
                }
            }
            if(activity_lvl_3.includes("Anti Yeast") || activity_lvl_3.includes("Anti Gram(-)") || activity_lvl_3.includes("Anti Gram(+)") || activity_lvl_3.includes("Bacteriocins") || activity_lvl_3.includes("Anti Tuberculosis") || activity_lvl_3.includes("Antibiofilm") || activity_lvl_3.includes("Antimalarial/antiplasmodial") || activity_lvl_3.includes("Anti HIV") || activity_lvl_3.includes("Anti HSV") && activity_lvl_2.includes("Antifungal") || activity_lvl_2.includes("Antibacterial") || activity_lvl_2.includes("Anuro defense") || activity_lvl_2.includes("Antiprotozoal") || activity_lvl_2.includes("Antiviral")){
                if (!activity_lvl_3.includes("Anti Yeast") && activity_lvl_2.includes("Antifungal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antifungal")
                }
                if (!activity_lvl_3.includes("Antimalarial/antiplasmodial") && activity_lvl_2.includes("Antiprotozoal")){
                    activity_lvl_3 = activity_lvl_3.concat("Antiprotozoal")
                }
                if (activity_lvl_2.includes("Anuro defense")){
                    activity_lvl_3 = activity_lvl_3.concat("Anuro defense")
                }
                if (activity_lvl_2.includes("Antiviral")){
                    if (!activity_lvl_3.includes("Anti HIV")){
                        if(!activity_lvl_3.includes("Anti HSV")){
                            activity_lvl_3 = activity_lvl_3.concat("Antiviral")
                        }
                    }
                }
                if (activity_lvl_2.includes("Antibacterial")){
                    if (!activity_lvl_3.includes("Anti Gram(-)")){
                        if(!activity_lvl_3.includes("Anti Gram(+)")){
                            if(!activity_lvl_3.includes("Bacteriocins")){
                                if(!activity_lvl_3.includes("Anti Tuberculoosis")){
                                    if(!activity_lvl_3.includes("Antibiofilm")){
                                        activity_lvl_3 = activity_lvl_3.concat("Antibacterial")
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const activities = await Activity.find({$and:[{"activity" : {"$in": activity_lvl_3}}, {'uniprot_code': {$ne : ""}},{ "length": { $gte : parseInt(interval_list[0])}},{ "length": { $lte : parseInt(interval_list[1])}}]}).lean();
            await exportCSVForAlignment(activities);
        }
    }
    postData = JSON.stringify({
        'sequences': req.body.sequences,
        'time': req.body.time
    });
    const options = {
        host: 'localhost',
        port: 4000,
        method: 'POST',
        path: '/api/alignment/',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    var req = http.request(options, (res) => {
        var data = ''
        res.on('data', (chunk) => {
            data += chunk.toString();
        });
        res.on('end', () => {
            console.log('No more data in response.');
            //var str2 = JSON.parse(Buffer.concat(data).toString());
            //var str2 = JSON.parse(JSON.stringify(data.replace('\n','\\n')));
            response.send(JSON.parse(data))
        });
    });
    
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(postData);    
    req.end();
};
async function exportCSVForAlignment(data){
    const csvWriter = createCsvWriter({
        path: './src/public/jobs/service3/service3.csv',
        header: [
            {id: 'sequence', title: 'sequence'}
        ]
      });      
    await csvWriter.writeRecords(data)
    console.log("The CSV file was written successfully")
}
indexCtrl.renderFrequency = async(req,res) =>{
    res.render('frequency');
};
indexCtrl.getFrequency = async(req,response) =>{
    postData = JSON.stringify({
        'sequences': req.body.sequences,
        'option': req.body.option,
        'time': req.body.time
    });    
    const options = {
        host: 'localhost',
        port: 4000,
        method: 'POST',
        path: '/api/frequency/',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    var req = http.request(options, (res) => {
        var data = ''
        res.on('data', (chunk) => {
            data = JSON.parse(chunk);
        });
        res.on('end', () => {
            console.log('No more data in response.');
            var str2 = JSON.parse(JSON.stringify(data));
            response.send(str2)
        });
    });
    
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(postData);    
    req.end();
};
indexCtrl.renderEncoding = async(req,res) =>{
    res.render('encoding');
};
indexCtrl.getEncoding = async(req,response) =>{
    postData = JSON.stringify({
        'sequences': req.body.sequences,
        'option': req.body.option,
        'time': req.body.time
    });    
    const options = {
        host: 'localhost',
        port: 4000,
        method: 'POST',
        path: '/api/encoding/',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    var req = http.request(options, (res) => {
        var data = ''
        res.on('data', (chunk) => {
            data = JSON.parse(chunk);
        });
        res.on('end', () => {
            console.log('No more data in response.');
            var str2 = JSON.parse(JSON.stringify(data));
            response.send(str2)
        });
    });
    
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(postData);    
    req.end();
};
module.exports = indexCtrl;

