const {Router} = require('express');
const router = Router();

const {getEncoding, renderEncoding, getFrequency, renderFrequency, getAlignment, getCharacterization, renderAlignment, renderClassification, renderCharacterization, renderDatabaseInformation,renderSequence, getSearch, getDatabasePerActivity, renderDetails, renderAbout, renderSearch, renderTools, renderIndex, renderDatabase, getDatabase} = require('../controllers/controller');

router.get('/', renderIndex); 
router.get('/about', renderAbout);
router.get('/database', renderDatabase);
router.get('/api/database', getDatabase);
router.get('/api/search', getSearch);
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


module.exports = router;