var express = require('express');
var fs = require('fs');
var path = require('path');
var util = require('util');
var Protector = require('./Protector');

var fell = require('fell');
fell.Log.configure("debug");
var log = fell.Log.getLogger('server');

var port = 3000;
var cssProtector = new Protector();

var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(401);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

app.post('/data', function(req, res){
	var scanResult = req.body;
	log.info("Received scan result from client : {0}", JSON.stringify(scanResult));
	cssProtector.submitScan(scanResult, function(err, doc) {
		if (err) {
			log.error("There was a problem adding the information to the database: {0}.", err);
			res.send("There was a problem adding the information to the database.");
		} else {
			var body = JSON.stringify(scanResult);
			log.debug("Scan result added to the database. {0}.", body);
			res.setHeader('Content-Type', 'text/plain');
			res.setHeader('Content-Length', Buffer.byteLength(body));
			res.end(body);
		}
	});
});

app.get('/', function(req, res){
	log.debug('Got request for index.');
	cssProtector.getAllScans(function(err, docs) {
		if (err) {
			log.error('Error reading from the database : {0}', err);
		}
		res.render('index', {title: 'cssProtector', results: docs});
	});
});

app.get('/diff', function(req, res) {
	log.debug('Got request for diff {0}.', util.inspect(req));
	var firstTime = Number(req.query.first);
	var secondTime = Number(req.query.second);

	cssProtector.diff(firstTime, secondTime, function(error, differences) {
		if (error) {
			log.error("Problem diffing {0} and {1} : {2}", firstTime, secondTime, error);
		}
		if (differences) {
			log.debug('Differences = {0}', util.inspect(differences,{depth:10}));
			res.render('diff', {title: 'cssProtector', differences: differences});
		} else {
			log.debug('No differences between {0} and {1}.', firstTime, secondTime);
			res.render('nodifference', {first: firstTime, second: secondTime});
		}
	});
});

app.listen(port);
log.info('Listening on port {0}.', port);