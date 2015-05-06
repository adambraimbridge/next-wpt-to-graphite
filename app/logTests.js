'use strict';

function LogTests(options, key) {
	this.options = options;
	this.key = key;
}

LogTests.prototype.fulfilled = function(data) {
	console.log("Fulfilled", data);
};

LogTests.prototype.failed = function(error) {
	console.error("Error", error);
};

module.exports = LogTests;