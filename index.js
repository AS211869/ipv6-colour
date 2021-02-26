var express = require('express');
var app = express();

app.listen('/', function(req, res) {
	res.end(req.hostname);
});

app.listen('16161', function() {
	console.log('Listening on port 16161');
});