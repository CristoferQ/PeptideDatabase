
const json = require('jsonify');

const options = {
    host: 'localhost',
    port: 4000,
    path: '/products'
};

router.get('/', (req,res) => {
    callback = function(response) {
        var str = '';      
        //another chunk of data has been received, so append it to `str`
        response.on('data', function (chunk) {
          str += chunk;
        });
        //the whole response has been received, so we just print it out here
        response.on('end', function () {
          var str2 = JSON.stringify(str);
          var str3 = JSON.parse(str2);
          res.render('index.html', {parrafo: str3});
        });
    }
    http.request(options, callback).end();
    
});
