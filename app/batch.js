'use strict';

module.exports = function batch(options) {
	var tests = require(process.cwd() + '/' + options.batch).tests;

	return tests.map(function(test) {
		var params = Object.create(options);

		// No Object.assign() yet =(
		params.url = test.url;
		params.pageType = test.pageType;
		params.location = test.location;

		return params;
	});
};
