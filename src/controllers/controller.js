const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const http = require('http');
const indexCtrl = {};
const Peptide = require('../models/Peptide'); //modelo de base de datos
const Statistic = require('../models/Statistic');
const Activity = require('../models/Activity');
const Organism = require('../models/Organism');
const rimraf = require("rimraf");

indexCtrl.renderIndex = async(req,res) =>{ //ruta de index
    const statistics_full = await Statistic.find({$and:[{'Name': {$ne : "Total number of records"}},{'Name': {$ne : "Total number of organism"}},{'Name': {$ne : "Total PDB codes"}},{'Name': {$ne : "Histogram1"}},{'Name': {$ne : "PieChart1"}},{'Name': {$ne : "Total Uniprot codes"}},{'Name': {$ne : "Glossary"}}]}).lean();
    res.render('index', {statistics_full});
};
indexCtrl.renderAbout = (req,res) =>{ //ruta de about
    res.render('about');
};
indexCtrl.renderDatabase = async(req,res) =>{ //ruta de about
    const statistics = await Statistic.find().lean();
    const activities = await Statistic.find({$and:[{'Name': {$ne : "Total number of records"}},{'Name': {$ne : "Total number of organism"}},{'Name': {$ne : "Total PDB codes"}},{'Name': {$ne : "Histogram1"}},{'Name': {$ne : "PieChart1"}},{'Name': {$ne : "Total Uniprot codes"}},{'Name': {$ne : "Glossary"}}]}).lean();
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
    if (req.params.id == 'Propeptide' || 
    req.params.id == 'Signal' || 
    req.params.id == 'Transit' ||
    req.params.id == 'Sensorial' ||
    req.params.id == 'Drugdeliveryvehicle' ||
    req.params.id == 'Therapeutic' ||
    req.params.id == 'Otheractivity' ||
    req.params.id == 'Neurologicalactivity' ||
    req.params.id == 'Immunologicalactivity' ||
    req.params.id == 'non_activity'
    ){
        if(req.params.id == 'Drugdeliveryvehicle'){
            req.params.id = 'Drug delivery vehicle'
        }
        if(req.params.id == 'Otheractivity'){
            req.params.id = 'Other activity'
        }
        if(req.params.id == 'Neurologicalactivity'){
            req.params.id = 'Neurological activity'
        }
        if(req.params.id == 'Immunologicalactivity'){
            req.params.id = 'Immunological activity'
        }
        const statistics = await Statistic.find({"Name": req.params.id}).lean();
        const statistics_full = await Statistic.find({$and:[{'Name': {$ne : "Total number of records"}},{'Name': {$ne : "Total number of organism"}},{'Name': {$ne : "Total PDB codes"}},{'Name': {$ne : "Histogram1"}},{'Name': {$ne : "PieChart1"}},{'Name': {$ne : "Total Uniprot codes"}},{'Name': {$ne : "Glossary"}}]}).lean();
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
    //console.log(req.body['activity_lvl_1[]'])   
    all_activities = []
    if (!Array.isArray(req.body['activity_lvl_1[]'])){
        if (req.body['activity_lvl_1[]'] != undefined){
            all_activities.push(req.body['activity_lvl_1[]']);
        }
    }
    if (Array.isArray(req.body['activity_lvl_1[]'])){
        all_activities = all_activities.concat(req.body['activity_lvl_1[]']);
    }
    if (!Array.isArray(req.body['activity_lvl_2[]'])){
        if (req.body['activity_lvl_2[]'] != undefined){
            all_activities.push(req.body['activity_lvl_2[]']);
        }
    }
    if (Array.isArray(req.body['activity_lvl_2[]'])){
        all_activities = all_activities.concat(req.body['activity_lvl_2[]']);
    }
    if (!Array.isArray(req.body['activity_lvl_3[]'])){
        if (req.body['activity_lvl_3[]'] != undefined){
            all_activities.push(req.body['activity_lvl_3[]']);
        }
    }
    if (Array.isArray(req.body['activity_lvl_3[]'])){
        all_activities = all_activities.concat(req.body['activity_lvl_3[]']);
    }
    if (!Array.isArray(req.body['activity_lvl_4[]'])){
        if (req.body['activity_lvl_4[]'] != undefined){
            all_activities.push(req.body['activity_lvl_4[]']);
        }
    }
    if (Array.isArray(req.body['activity_lvl_4[]'])){
        all_activities = all_activities.concat(req.body['activity_lvl_4[]']);
    }
    if (!Array.isArray(req.body['activity_lvl_5[]'])){
        if (req.body['activity_lvl_5[]'] != undefined){
            all_activities.push(req.body['activity_lvl_5[]']);
        }
    }
    if (Array.isArray(req.body['activity_lvl_5[]'])){
        all_activities = all_activities.concat(req.body['activity_lvl_5[]']);
    }
    console.log(all_activities)
    for (let index = 0; index < all_activities.length; index++) {
        console.log(all_activities[index])
        if (all_activities[index] == 'Quorum sensing' || all_activities[index] == 'Chemotactic' || all_activities[index] == 'Cell-cell communication' || all_activities[index] == 'Defense'){    
            var flag = all_activities.indexOf('Sensorial');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Cell-penetrating' || all_activities[index] == "Blood-brain barrier crossing"){    
            var flag = all_activities.indexOf('Drug delivery vehicle');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antimicrobial' || all_activities[index] == "Toxic" || all_activities[index] == "Metabolic" || all_activities[index] == "Anticancer" || all_activities[index] == "Bioactive"){    
            var flag = all_activities.indexOf('Therapeutic');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Cancer cell' || all_activities[index] == "Mammallian cell" || all_activities[index] == "Proteolytic" || all_activities[index] == "Surface-immobilized"){    
            var flag = all_activities.indexOf('Other activity');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Neuropeptide' || all_activities[index] == "Antinociceptive" || all_activities[index] == "Brain peptide"){    
            var flag = all_activities.indexOf('Neurological activity');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Allergen' || all_activities[index] == 'Immunomodulatory'){    
            var flag = all_activities.indexOf('Immunological activity');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antiviral' || all_activities[index] == 'Antibacterial/antibiotic' || all_activities[index] == 'Antifungal' || all_activities[index] == 'Antiprotozoal' || all_activities[index] == 'Anuro defense'){    
            var flag = all_activities.indexOf('Antimicrobial');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antiparasitic' || all_activities[index] == 'Cytolytic' || all_activities[index] == 'Insecticidal'){    
            var flag = all_activities.indexOf('Toxic');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antihypertensive' || all_activities[index] == 'Anti Diabetic' || all_activities[index] == 'Antiinflammatory' || all_activities[index] == 'Enzyme inhibitor' || all_activities[index] == 'Regulatory' || all_activities[index] == 'Anti Angiogenic'){    
            var flag = all_activities.indexOf('Metabolic');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antitumour'){    
            var flag = all_activities.indexOf('Anticancer');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antioxidant'){    
            var flag = all_activities.indexOf('Bioactive');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Wound healing'){    
            var flag = all_activities.indexOf('Immunomodulatory');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Anti HIV' || all_activities[index] == 'Anti HSV'){    
            var flag = all_activities.indexOf('Antiviral');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antibiofilm' || all_activities[index] == 'Anti Gram(+)' || all_activities[index] == 'Anti Gram(-)' || all_activities[index] == 'Anti TB' || all_activities[index] == 'Bacteriocins'){    
            var flag = all_activities.indexOf('Antibacterial/antibiotic');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Anti Yeast'){    
            var flag = all_activities.indexOf('Antifungal');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antimalarial/antiplasmodial'){    
            var flag = all_activities.indexOf('Antiprotozoal');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Hemolytic'){    
            var flag = all_activities.indexOf('Cytolytic');
            delete all_activities[flag];
        }
        if (all_activities[index] == 'Antilisterial' || all_activities[index] == 'Anti MRSA'){    
            var flag = all_activities.indexOf('Anti Gram(+)');
            delete all_activities[flag];
        }
    }
    all_activities = all_activities.filter(function(e){return e});
    //console.log(all_activities)
    //console.log(req.body['organisms[]'])
    //console.log(req.body.uniprot)
    //console.log(req.body['interval[]'][1])
    //console.log(req.body.time)
    
    if (req.body['organisms[]'].includes('all') == true){
        if (req.body.uniprot == 'false'){
            if (all_activities != ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": all_activities}},{ "length": { $gte : parseInt(req.body['interval[]'][0])}},{ "length": { $lte : parseInt(req.body['interval[]'][1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }
        if (req.body.uniprot == 'true'){
            if (all_activities != ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": all_activities}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}}, { "length": { $gte : parseInt(req.body['interval[]'][0])}},{ "length": { $lte : parseInt(req.body['interval[]'][1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }
    }
    if (req.body['organisms[]'].includes("") == false && req.body['organisms[]'].includes('all') == false){
        if (req.body.uniprot == 'false'){
            if (all_activities != ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": all_activities}},{"organism_value" : {"$in": req.body['organisms[]']}},{ "length": { $gte : parseInt(req.body['interval[]'][0])}},{ "length": { $lte : parseInt(req.body['interval[]'][1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }
        if (req.body.uniprot == 'true'){
            if (all_activities != ''){
                const activities = await Activity.find({$and:[{"activity" : {"$in": all_activities}},{"organism_value" : {"$in": req.body['organisms[]']}}, {'uniprot_code': {$ne : ""}},{'uniprot_code': {$ne : "0"}}, { "length": { $gte : parseInt(req.body['interval[]'][0])}},{ "length": { $lte : parseInt(req.body['interval[]'][1])}}]}).lean();
                //await exportQueryJSON(activities, req.query.time);
                //await exportQueryCSV(activities, req.query.time);
                res.send(activities);
            }
        }
    }
}
indexCtrl.renderSequence = async(req,res) =>{
    const peptides = await Peptide.find({"id_sequence":req.query.id_sec}).lean();
    res.render('sequence', {peptides});
};
indexCtrl.renderDatabaseInformation = async(req,res) =>{
    res.render('database_information');
};
indexCtrl.renderCharacterization = async(req,res) =>{
    const statistics = await Statistic.find().lean();
    res.render('characterization', {statistics});
};
indexCtrl.getCharacterization = async(req,response) =>{    
    path_job = "./src/public/jobs/service1/"+req.body.time
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
            setTimeout(function test(){
                rimraf(path_job, function () { console.log("done"); });
            },10000);    // 1800000 = 30min
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
    path = "./src/public/jobs/service3/"+req.body.time
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
            var str2 = JSON.parse(data);
            response.send(str2)
        });
    });
    
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(postData);    
    req.end();
};
// async function exportCSVForAlignment(data){
//     const csvWriter = createCsvWriter({
//         path: './src/public/jobs/service3/service3.csv',
//         header: [
//             {id: 'sequence', title: 'sequence'}
//         ]
//       });      
//     await csvWriter.writeRecords(data)
//     console.log("The CSV file was written successfully")
// }
indexCtrl.renderFrequency = async(req,res) =>{
    res.render('frequency');
};
indexCtrl.getFrequency = async(req,response) =>{
    path_job = "./src/public/jobs/service4/"+req.body.time
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
            setTimeout(function test(){
                rimraf(path_job, function () { console.log("done"); });
            },10000);    //10sec
        });
    });
    
    req.on('error', (e) => {
        console.log("ok")
        console.error(`problem with request: ${e.message}`);
    });
    req.write(postData);    
    req.end();
};
indexCtrl.renderEncoding = async(req,res) =>{
    res.render('encoding');
};
indexCtrl.getEncoding = async(req,response) =>{
    path_job = "./src/public/jobs/service5/"+req.body.time
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
            response.send(str2);
            setTimeout(function test(){
                rimraf(path_job, function () { console.log("done"); });
                rimraf(path_job+".tar.gz", function () { console.log("done"); });
            },10000);    //10sec
        });
    });
    
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(postData);    
    req.end();
};
indexCtrl.renderTraining = async(req,res) =>{
    res.render('training');
};
indexCtrl.getTraining = (req,response) =>{
    postData = JSON.stringify({
        //'sequences': req.body.sequences,
        //'option': req.body.option,
        //'time': req.body.time
        'status': "ok"
    });    
    response.send(postData)
    //const options = {
    //    host: 'localhost',
    //    port: 4000,
    //    method: 'POST',
    //    path: '/api/encoding/',
    //    headers: {
    //        'Content-Type': 'application/json',
    //        'Content-Length': Buffer.byteLength(postData)
    //    }
    //};
    //var req = http.request(options, (res) => {
    //    var data = ''
    //    res.on('data', (chunk) => {
    //        data = JSON.parse(chunk);
    //    });
    //    res.on('end', () => {
    //        console.log('No more data in response.');
    //        var str2 = JSON.parse(JSON.stringify(data));
    //        response.send(str2)
    //    });
    //});
    //req.on('error', (e) => {
    //    console.error(`problem with request: ${e.message}`);
    //});
    //req.write(postData);    
    //req.end();
};
indexCtrl.renderGlossary = async(req,res) =>{ 
    const statistics = await Statistic.find().lean();
    res.render('glossary', {statistics});
};
module.exports = indexCtrl;
