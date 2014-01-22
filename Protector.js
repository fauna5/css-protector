var express = require('express');
var fs = require('fs');
var mongo = require('mongodb');
var monk = require('monk');
var path = require('path');
var util = require('util');
var diff = require('deep-diff').diff;
var _ = require('lodash');
var log = require('fell').Log.getLogger('Protector');

function Protector() {
	this.db = null;
}

Protector.prototype.submitScan = function(scanResult, callback) {
	var collection = this._getDb().get('scanResults');
	collection.insert(scanResult, function (err, doc) {
		if (err) {
			log.error("There was a problem adding the information to the database: {0}.", err);
			callback(err);
		} else {
			callback(null, doc);
		}
	});
};

Protector.prototype.getAllScans = function(callback) {
	var collection = this._getDb().get('scanResults');
	collection.find({}, {}, function(err, docs) {
		if (err) {
			log.error('Error reading from the database : {0}', err);
			callback(err);
		} else {
			docs = docs || [];
			log.debug('Documents retrieved : {0}', util.inspect(docs,{depth:4}));
			callback(null, docs);
		}
	});
};

Protector.prototype.diff = function(firstId, secondId, callback) {
	log.debug('Diffing {0}, {1}.',firstId, secondId);

	var error = null;
	var first = null;
	var second = null;

	function doTheDiff() {
		if (error !== null) {
			callback(error);
		} else {
			var differences = diff(first.data, second.data);
			callback(null, differences);
		}
	}

	var finished = _.after(2, doTheDiff);

	var collection = this._getDb().get('scanResults');
	collection.find({ time: firstId },{},function(e,docs){
		if (e !== null) {
			error = e;
		} else {
			first = docs[0];
		}
		finished();
	});

	collection.find({ time: secondId },{},function(e,docs){
		if (e !== null) {
			error = e;
		} else {
			second = docs[0];
		}
		finished();
	});
};

/* this is to allow the database to be replaced for testing */
Protector.prototype._getDb = function() {
	if (this.db === null) {
		this.db = monk('localhost:27017/cssProtector');
	}
	return this.db;
};

module.exports = Protector;