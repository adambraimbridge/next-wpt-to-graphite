'use strict';

var url = require('url');
var net = require('net');

var GRAPHITE_PORT = 2003;
var GRAPHITE_URL = 'carbon.hostedgraphite.com';
var GRAPHITE_NAMESPACE = 'wpt';
var COLLECT_PROPERTIES = [
	'TTFB',
	'render',
	'domContentLoadedEventStart',
	'domContentLoadedEventEnd',
	'loadEventStart',
	'loadEventEnd',
	'fullyLoaded',
	'requestsDoc',
	'responses_200',
	'responses_404'
];

function LogTests(options, key) {
	this.options = options;
	this.key = key;
}

LogTests.prototype.saveReports = function(data) {
	var reports = data.map(this.buildReport.bind(this));

	var metrics = reports.reduce(function(a, b) {
		return a.concat(b);
	}, []);

	var socket = net.createConnection(GRAPHITE_PORT, GRAPHITE_URL, function(error) {
		if (error) {
			throw error;
		}

		metrics.forEach(function(line) {
			socket.write(line + '\n');
		});

		socket.end();
	});
};

LogTests.prototype.buildReport = function(data) {
	var meta = this.reportMetaData(data);
	var metric = this.reportMetric(meta);
	var testReport = data[this.options.average].firstView;

	return COLLECT_PROPERTIES.map(function(property) {
		return metric + '.' + data.pageType + '.' + property + ' ' + testReport[property];
	});
};

LogTests.prototype.reportMetric = function(meta) {
	function format(property) {
		return property.trim().replace(/[\s\.,]+/g, '_').toLowerCase();
	}

	return [
		this.key,
		GRAPHITE_NAMESPACE,
		format(meta.hostname),
		format(meta.location),
		format(meta.browser)
	].join('.');
};

LogTests.prototype.reportMetaData = function(data) {
	return {
		// E.G. http://next.ft.com/380e7966-b07f-11e4-9b8e-00144feab7de
		hostname: url.parse(data.url).hostname,
		// E.G. Europe Dublin AWS - Prod - <b>Chrome</b> - <b>Cable</b>
		location: data.from.match(/^([\w\s,]+)/)[1],
		browser: data.from.match(/<b\>([\w\s]+)<\/b\>/)[1]
	};
};

module.exports = LogTests;
