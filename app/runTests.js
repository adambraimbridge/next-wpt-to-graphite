'use strict';

var async = require('async');
var WebPageTest = require('webpagetest');

var PUBLIC_SERVER = /webpagetest\.org/;

function RunTests(options, key) {
	this.key = options.server.match(PUBLIC_SERVER) ? key : null;
	this.options = options;
}

RunTests.prototype.run = function(callback) {
	this.wpt = new WebPageTest(this.options.server, this.key);

	this.runStartTime = new Date();

	async.waterfall([
		this.start.bind(this),
		this.poll.bind(this),
		this.end.bind(this)
	], callback);
};

RunTests.prototype.start = function(callback) {
	this.log('Test started at ' + this.runStartTime.toTimeString());

	this.wpt.runTest(this.options.url, this.options, function(error, response) {
		callback(error, response.data.testId);
	});
};

RunTests.prototype.poll = function(testId, callback) {
	this.wpt.getTestStatus(testId, this.options, function(error, response) {
		var statusCode = !error && response.data.statusCode;

		if (error || statusCode >= 400) {
			return callback(error || new Error(response.data.statusText));
		}

		if (statusCode === 200) {
			return callback(null, testId);
		}

		if (this.pollHasTimedOut()) {
			return this.cancel(testId, function() {
				callback(new Error('Operation timed out.'));
			});
		}

		this.log('Polling test #' + testId);

		setTimeout(this.poll.bind(this), this.options.wait, testId, callback);

	}.bind(this));
};

RunTests.prototype.end = function(testId, callback) {
	this.log('Test completed at ' + new Date().toTimeString());

	this.wpt.getTestResults(testId, this.options, function(error, response) {
		callback(error, response.data);
	});
};

RunTests.prototype.cancel = function(testId, callback) {
	this.wpt.cancelTest(testId, this.options, callback);
};

RunTests.prototype.pollHasTimedOut = function() {
	return Date.now() - this.runStartTime.getTime() >= this.options.timeout;
};

RunTests.prototype.log = function(message) {
	this.options.verbose && console.log(message);
};

module.exports = RunTests;
