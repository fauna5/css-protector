var express = require('express');
var fs = require('fs');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/cssProtector');
var path = require('path');
var util = require('util');
var diff = require('deep-diff').diff;
var _ = require('lodash');

var fell = require('fell');
fell.Log.configure("debug");
var log = fell.Log.getLogger('cssProtector');


var port = 3000;

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
	var collection = db.get('scanResults');
	collection.insert(scanResult, function (err, doc) {
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
	var collection = db.get('scanResults');
	collection.find({},{},function(e, docs){
		if (e) {
			log.error('Error reading from the database : {0}', e);
		}
		docs = docs || [];

		log.debug('Documents retrieved : {0}', util.inspect(docs,{depth:4}));
		res.render('index', {title: 'cssProtector', results: docs});
	});
});

app.get('/diff', function(req, res){
	log.debug('Got request for diff.');
	var firstTime = req.query.first;
	var secondTime = req.query.second;
	log.debug('Diffing {0}, {1}.',firstTime, secondTime);

	var first = null;
	var second = null;

	var doRender = function(){
		var differences = diff(first.data, second.data);
		log.debug('differences = {0}', util.inspect(differences,{depth:10}));
		res.render('diff', {title: 'cssProtector', differences: differences});
	}

	var finished = _.after(2, doRender);

	var collection = db.get('scanResults');
	collection.find({ time: +firstTime },{},function(e,docs){
		first = docs[0];
		finished();
	});	

	collection.find({ time: +secondTime },{},function(e,docs){
		second = docs[0];
		finished();
	});


});

app.listen(port);
log.info('Listening on port {0}.', port);
