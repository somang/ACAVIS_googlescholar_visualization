var express = require('express');
var app = express();
var path = require('path');
var router = express.Router();



app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
});


// add the router
app.use('/', router);
app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 3000, function () {
	console.log('listening at port');
});
