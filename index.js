var express = require('express');
var ip6 = require('ip6');
var isIp = require('is-ip');
var app = express();

app.get('/', function(req, res) {
	// eslint-disable-next-line no-unused-vars
	var hostname = req.hostname;
	// eslint-disable-next-line no-useless-escape
	var hostnameWithoutBrackets = req.hostname.replace(/[\[\]]/g, '');
	var isIPv6 = isIp.v6(hostnameWithoutBrackets);

	if (!isIPv6) {
		return res.end(`You need to use IPv6 to access this page. You are currently accessing ${hostnameWithoutBrackets}`);
	}

	var fullIP = ip6.normalize(hostnameWithoutBrackets);
	var colourChars = fullIP.split(':').slice(5).join('');
	var firstColour = colourChars.substring(0, 6);
	var secondColour = colourChars.substring(6, 12);

	res.end(`You are connected to ${fullIP} and the colour characters are ${colourChars}. The first colour is ${firstColour} and the second colour is ${secondColour}`);
});

app.listen('16161', function() {
	console.log('Listening on port 16161');
});