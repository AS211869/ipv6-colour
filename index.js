var express = require('express');
var ip6 = require('ip6');
var isIp = require('is-ip');
var fs = require('fs');
var path = require('path');
var app = express();

var texts = fs.readdirSync(path.join(__dirname, 'texts'));

console.log(`Loaded ${texts.length} texts`);

function ipv6ColourMiddleware(req, res, next) {
	// eslint-disable-next-line no-unused-vars
	var hostname = req.hostname;
	// eslint-disable-next-line no-useless-escape
	var hostnameWithoutBrackets = req.hostname.replace(/[\[\]]/g, '');
	var isIPv6 = isIp.v6(hostnameWithoutBrackets);

	if (!isIPv6) {
		return res.end(`You need to use IPv6 to access this page. You are currently accessing ${hostnameWithoutBrackets}`);
	}

	req.fullIP = ip6.normalize(hostnameWithoutBrackets);
	req.textId = req.fullIP.split(':').slice(4, 5)[0];
	req.colourChars = req.fullIP.split(':').slice(5).join('');
	req.firstColour = req.colourChars.substring(0, 6);
	req.secondColour = req.colourChars.substring(6, 12);

	next();
}

app.set('view engine', 'ejs');

app.get('/', ipv6ColourMiddleware, function(req, res) {
	res.end(`You are connected to ${req.fullIP} and the colour characters are ${req.colourChars}. The first colour is ${req.firstColour} and the second colour is ${req.secondColour}. ${req.textId}`);
});

app.get('/text', ipv6ColourMiddleware, function(req, res) {
	if (texts.includes(`${req.textId}.txt`)) {
		return res.render('index', { textId: req.textId, bgColour: req.firstColour, textColour: req.secondColour });
	}

	res.render('index', { textId: texts[Math.floor(Math.random() * texts.length)].replace('.txt', ''), bgColour: req.firstColour, textColour: req.secondColour });
});

app.listen('16161', function() {
	console.log('Listening on port 16161');
});