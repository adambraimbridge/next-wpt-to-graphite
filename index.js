'use strict';

var minimist = require('minimist');
var denodeify = require('denodeify');

var batch = require('./app/batch');
var RunTests = require('./app/runTests');
var LogTests = require('./app/logTests');

var argv = minimist(process.argv.slice(2));

var options = {
	// Single test options
	url: argv.u,
	pageType: argv.p,
	// Batch test options
	batch: argv.b,
	// WPT options
	runs: argv.r || 1,
	wait: (argv.w || 5) * 1000,
	timeout: argv.t || 180,
	server: argv.s || 'www.webpagetest.org',
	location: argv.l || 'Dulles:Chrome',
	verbose: argv.v || true,
	// Graphite options
	average: argv.a || 'median'
};

var accessTokens = {
	wpt: process.env.WPT_APIKEY,
	graphite: process.env.HOSTEDGRAPHITE_APIKEY
};

var tests = options.batch ? batch(options) : [ options ];

Promise
	.all( tests.map(function(test) {
		var suite = new RunTests(test, accessTokens.wpt);
		return denodeify(suite.run.bind(suite))();
	}) )
	.then(function(data) {
		var log = new LogTests(options, accessTokens.graphite);
		log.saveReports(data);
	})
	.catch(function(error) {
		console.error(error);
	});
