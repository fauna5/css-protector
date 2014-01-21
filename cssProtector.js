var express = require('express');
var fs = require('fs');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/cssProtector');
var path = require('path');

var fell = require('fell');
fell.Log.configure("debug");
var log = fell.Log.getLogger('cssProtector');


var port = 3000;

var app = express();
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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

app.get('/scanner.js', function(req, res){
	res.setHeader('Content-Type', 'text/javascript');
	fs.createReadStream('scanner.js').pipe(res);
});

app.get('/', function(req, res){
	log.debug('Got request for index.');
	var collection = db.get('scanResults');
	collection.find({},{},function(e,docs){
		// var body = 'Found\n';
		// for (var i = docs.length - 1; i >= 0; i--) {
		// 	body = body + JSON.stringify(docs[i]) + '\n';
		// };
		//res.setHeader('Content-Type', 'text/plain');
		//res.setHeader('Content-Length', Buffer.byteLength(body));
		log.debug(docs);
		res.render('index', {results: docs});
	});
});

app.get('/diff', function(req, res){
	log.debug('Got request for diff.');
	var firstTime = req.query.first;
	var secondTime = req.query.second;
	log.debug('Diffing {0}, {1}.',firstTime, secondTime);

	var first = null;
	var second = null;

	var finished = _.after(2, doRender);

	function doRender(){
	  res.render(); // etc
	}

	var collection = db.get('scanResults');
	collection.find({ time: 1 },{},function(e,docs){
		var body = 'Found\n';
		for (var i = docs.length - 1; i >= 0; i--) {
			body = body + JSON.stringify(docs[i]) + '\n';
		}
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Content-Length', Buffer.byteLength(body));
		res.end(body);
	});
});

app.listen(port);
log.info('Listening on port {0}.', port);