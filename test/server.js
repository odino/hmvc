fs = require('fs');

require('http').createServer(function (req, res) {
    res.writeHead(200);
    console.log(req.url)
    fs.readFile('./' + req.url, 'utf8', function(err, data){
        res.end(data);
    });
}).listen(9123);

console.log('test server running...')
