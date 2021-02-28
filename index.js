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

function log(req, res, next) {
	var showRandom = !texts.includes(`${req.textId}.txt`);
	// eslint-disable-next-line no-useless-escape
	console.log(`Someone requested ${req.hostname.replace(/[\[\]]/g, '')}. Showing ${showRandom ? 'random' : req.textId} with background colour ${req.firstColour} and text colour ${req.secondColour}`);
	next();
}

app.set('view engine', 'ejs');

app.get('/', ipv6ColourMiddleware, log, function(req, res) {
	if (texts.includes(`${req.textId}.txt`)) {
		return res.render('index', { textId: req.textId, bgColour: req.firstColour, textColour: req.secondColour });
	}

	res.render('index', { textId: texts[Math.floor(Math.random() * texts.length)].replace('.txt', ''), bgColour: req.firstColour, textColour: req.secondColour });
});

app.listen('16161', function() {
	console.log('Listening on port 16161');
});