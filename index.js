'use strict';

var RunTests = require('./app/runTests');
var LogTests = require('./app/logTests');

var argv = require('minimist')(process.argv.slice(2));

var wptOptions = {
	url: argv.u,
	runs: argv.r || 1,
	wait: argv.w || 1000 * 5,
	server: argv.s || 'http://www.webpagetest.org',
	location: argv.l || 'Dulles:Chrome'
};

var logOptions = {
	pageType: argv.p
};

var accessTokens = {
	wpt: process.env.WPT_APIKEY,
	graphite: process.env.HOSTEDGRAPHITE_APIKEY
};

var log = new LogTests(logOptions, accessTokens.graphite);
var suite = new RunTests(wptOptions, accessTokens.wpt);

suite.run(function(error, data) {
	if (error) {
		log.failed(error);
	} else {
		log.fulfilled(data);
	}
});
