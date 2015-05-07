var url = require('url');
var net = require('net');

const port = 2003;
const href = 'carbon.hostedgraphite.com';

const properties = [
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

LogTests.prototype.fulfilled = function(data) {
	var report = this.buildReport(data);

	var socket = net.createConnection(port, href, function(error) {
		if (error) {
			exit(error);
		}

		report.forEach(function(line) {
			socket.write(line + '\n');
		});

		socket.end();
	});
};

LogTests.prototype.failed = function(error) {
	console.error("Error", error);
};

LogTests.prototype.buildReport = function(data) {
	var meta = this.reportMetaData(data);
	var metric = this.reportMetric(meta);
	var testReport = data[this.options.average].firstView;

	return properties.map(function(property) {
		return metric + '.' + property + ' ' + testReport[property];
	});
};

LogTests.prototype.reportMetric = function(meta) {
	function format(property) {
		return property.trim().replace(/[\s\.,]+/g, '_').toLowerCase();
	}

	return [
		this.key,
		'webpagetest',
		format(meta.hostname),
		format(meta.location),
		format(meta.browser),
		this.options.pageType
	].join('.');
};

LogTests.prototype.reportMetaData = function(data) {
	return {
		// E.G. http://next.ft.com/380e7966-b07f-11e4-9b8e-00144feab7de
		hostname: url.parse(data.url).hostname,
		// E.G. Europe Dublin AWS - Prod - <b>Chrome</b> - <b>Cable</b>
		location: data.from.match(/^([\w\s,]+)/)[1],
		browser: data.from.match(/\<b\>([\w\s]+)\<\/b\>/)[1]
	};
};

module.exports = LogTests;