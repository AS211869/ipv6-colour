var express = require('express');
var ip6 = require('ip6');
var isIp = require('is-ip');
var ipAddress = require('ip-address');
var isValidDomain = require('is-valid-domain');
var fs = require('fs');
var path = require('path');
var dns = require('dns');
var moment = require('moment');
var app = express();

var config = require('./config.json');
var assignedPrefix = new ipAddress.Address6(config.prefix);
var texts = fs.readdirSync(path.join(__dirname, 'texts'));

console.log(`Loaded ${texts.length} texts`);

function validateHostname(hostname, cb) {
	var isIPv6 = isIp.v6(hostname);
	if (!isIPv6) {
		if (isValidDomain(hostname)) {
			if (!hostname.endsWith(config.dnsWhitelist)) {
				return cb('Hostname is not part of the whitelisted domain', null);
			}

			dns.lookup(hostname, 6, function(err, address) {
				if (err) {
					return cb(`Failed to do DNS lookup: ${err}`, null);
				}

				return cb(null, true, address);
			});
		} else {
			return cb(`You need to use IPv6 to access this page. You are currently accessing ${hostname}`, null);
		}
	} else {
		/** @type {ipAddress.Address6} */
		var ip;

		try {
			ip = new ipAddress.Address6(hostname);
		} catch (e) {
			return cb(`Invalid hostname: ${e}`, null);
		}

		if (!ip.isInSubnet(assignedPrefix)) {
			return cb('Hostname is not in configured prefix', null);
		}
	}

	return cb(null, null);
}

function ipv6ColourMiddleware(req, res, next) {
	// eslint-disable-next-line no-unused-vars
	//var hostname = req.hostname;
	// eslint-disable-next-line no-useless-escape
	var hostnameWithoutBrackets = req.hostname.replace(/[\[\]]/g, '');

	validateHostname(hostnameWithoutBrackets, function(err, newHostname) {
		if (err) {
			return res.status(500).end(err);
		}

		if (newHostname !== null) hostnameWithoutBrackets = newHostname;

		req.fullIP = ip6.normalize(hostnameWithoutBrackets);
		req.textId = req.fullIP.split(':').slice(4, 5)[0];
		req.colourChars = req.fullIP.split(':').slice(5).join('');
		req.firstColour = req.colourChars.substring(0, 6);
		req.secondColour = req.colourChars.substring(6, 12);

		next();
	});
}

function log(req, res, next) {
	var showRandom = !texts.includes(`${req.textId}.txt`);
	// eslint-disable-next-line no-useless-escape
	console.log(`${moment.utc()}: Someone requested ${req.hostname.replace(/[\[\]]/g, '')}. Showing ${showRandom ? 'random' : req.textId} with background colour ${req.firstColour} and text colour ${req.secondColour}`);
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