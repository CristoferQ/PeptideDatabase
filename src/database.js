const mongoose = require('mongoose');

const MONGODB_URI = `mongodb://localhost/Peptides`;

mongoose.connect(MONGODB_URI,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
})
    .then(db => console.log('database connected'))
    .catch(err => console.log(err));