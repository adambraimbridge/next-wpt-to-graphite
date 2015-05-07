'use strict';

var RunTests = require('./app/runTests');
var LogTests = require('./app/logTests');

var argv = require('minimist')(process.argv.slice(2));

var wptOptions = {
	url: argv.u,
	runs: argv.r || 1,
	wait: (argv.w || 5) * 1000,
	timeout: argv.t || 180,
	server: argv.s || 'www.webpagetest.org',
	location: argv.l || 'Dulles:Chrome',
	verbose: argv.v || true
};

var logOptions = {
	pageType: argv.p,
	average: argv.a || 'median'
};

var accessTokens = {
	wpt: process.env.WPT_APIKEY,
	graphite: process.env.HOSTEDGRAPHITE_APIKEY
};

var log = new LogTests(logOptions, accessTokens.graphite);
var suite = new RunTests(wptOptions, accessTokens.wpt);

suite.run(function(error, data) {
	if (error) {
		log.failure(error);
	} else {
		log.fulfilled(data);
	}
});
