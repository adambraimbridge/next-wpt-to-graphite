'use strict';

var async = require('async');
var WebPageTest = require('webpagetest');

function RunTests(options, key) {
	this.key = /internal/.test(options.server) ? null : key;
	this.options = options;
}

RunTests.prototype.run = function(callback) {
	this.wpt = new WebPageTest(this.options.server, this.key);

	async.waterfall([
		this.start.bind(this),
		this.poll.bind(this),
		this.end.bind(this)
	], callback);
};

RunTests.prototype.start = function(callback) {
	this.wpt.runTest(this.options.url, this.options, function(error, response) {
		callback(error, response.data.testId);
	});
};

RunTests.prototype.poll = function(testId, callback) {
	this.wpt.getTestStatus(testId, this.options, function(error, response) {
		var statusCode = response.data.statusCode;

		if (error || statusCode >= 400) {
			return callback(error || new Error(response.data.statusText));
		}

		if (statusCode == 200) {
			return callback(null, testId);
		}

		setTimeout(this.poll.bind(this), this.options.wait, testId, callback);
	}.bind(this));
};

RunTests.prototype.cancel = function(testId, callback) {
	this.wpt.cancelTest(testId, this.options, callback);
};

RunTests.prototype.end = function(testId, callback) {
	this.wpt.getTestResults(testId, this.options, function(error, response) {
		callback(error, response.data);
	});
};

module.exports = RunTests;
