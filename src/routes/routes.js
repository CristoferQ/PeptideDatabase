const {Router} = require('express');
const router = Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './src/public/jobs/service6')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname)
    }
})
const upload = multer({storage})

const {renderGlossary, getTraining, renderTraining, getEncoding, renderEncoding, getFrequency, renderFrequency, getAlignment, getCharacterization, renderAlignment, renderClassification, renderCharacterization, renderDatabaseInformation,renderSequence, getSearch, getDatabasePerActivity, renderDetails, renderAbout, renderSearch, renderTools, renderIndex, renderDatabase, getDatabase} = require('../controllers/controller');

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
router.get('/alignment', renderAlignment);
router.post('/alignment/results', getAlignment);
router.get('/frequency', renderFrequency);
router.post('/frequency/results', getFrequency);
router.get('/encoding', renderEncoding);
router.post('/encoding/results', getEncoding);
router.get('/training', renderTraining);
router.post('/training/results', upload.single('file'), getTraining);
router.get('/glossary', renderGlossary);

module.exports = router;