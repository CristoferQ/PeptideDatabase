const {Router} = require('express');
const router = Router();
var multer = require("multer");
var url = require('url');
//var upload = multer({dest: './src/public/jobs/service6/tmp'});

const {getClassification, renderGlossary, getTraining, renderTraining, getEncoding, renderEncoding, getFrequency, renderFrequency, getAlignment, getCharacterization, renderAlignment, renderClassification, renderCharacterization, renderDatabaseInformation,renderSequence, getSearch, getDatabasePerActivity, renderDetails, renderAbout, renderSearch, renderTools, renderIndex, renderDatabase, getDatabase} = require('../controllers/controller');

router.get('/', renderIndex); 
router.get('/about', renderAbout);
router.get('/database', renderDatabase);
router.get('/api/database', getDatabase);
router.post('/api/search', getSearch);
router.get('/search', renderSearch);
router.get('/tools', renderTools);
router.get('/details/:id', renderDetails);
router.get('/api/database/:id', getDatabasePerActivity);
router.get('/sequence', renderSequence);
router.get('/database_information', renderDatabaseInformation);
router.get('/characterization', renderCharacterization);
router.post('/characterization/results', getCharacterization);
router.get('/classification', renderClassification);
router.post('/classification/results', getClassification);
router.get('/alignment', renderAlignment);
router.post('/alignment/results', getAlignment);
router.get('/frequency', renderFrequency);
router.post('/frequency/results', getFrequency);
router.get('/encoding', renderEncoding);
router.post('/encoding/results', getEncoding);
router.get('/training', renderTraining);

var storage1 = multer.diskStorage({ 
    
    destination: function (req, file, cb) { 
        cb(null, "./src/public/jobs/service6/tmp") 
    }, 
    filename: function (req, file, cb) { 
        cb(null, file.fieldname+".csv") 
        console.log(req.url)
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        console.log(query.time)
    } 
}) 

var upload1 = multer({  
    storage: storage1,  
}).any();//array(['dataset', 'response']); 

//var upload2 = multer({  
//    storage: storage2,  
//}).single("response"); 



router.post("/training/upload",function (req, res, next) {     
    upload1(req,res,function(err) { 
        if(err) { 
            res.send(err) 
        } 
        else { 
            console.log("Success, response uploaded!") 
            res.send({"response":"ok"})
        } 
    }) 
    //upload2(req,res,function(err) { 
    //    if(err) { 
    //        res.send(err) 
    //    } 
    //    else { 
    //        console.log("Success, response uploaded!") 
    //    } 
    //}) 
}) 


router.post('/training/results', getTraining);

router.get('/glossary', renderGlossary);

module.exports = router;