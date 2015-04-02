var WebPageTest = require('webpagetest');
var http = require('http');
var fs = require('fs');
var net = require('net');
var argv = require('minimist')(process.argv.slice(2));
var domain = require('domain');
var url = require('url').parse(argv.u);
var wpt = new WebPageTest();
var test_ID;
var test_status;
var GraphiteAPIKey = process.env.HOSTEDGRAPHITE_APIKEY;
var wptAPIKey = process.env.WPT_APIKEY;
var wpt_server = argv.s;
var location = argv.l;
var pageType = argv.p;
var numRuns = argv.r;
var hostname = url.hostname;
var browser;
var country;
var postPayload = "";
var firstLine = true;

// Make sure location is provided
if(typeof location == 'undefined' || typeof pageType == 'undefined' || typeof url == 'undefined'){
	console.log('Missing required parameter.  Correct usage is "node app.js -l browser_location -u url -p pageType -s server""');
	return 'error';
}

// get Country and Browser metrics from the location
country = location.substring(0,location.indexOf('_')).toLowerCase();
if(country == "")country = location.substring(0,location.indexOf(':')).toLowerCase();
browser = location.substring(location.lastIndexOf(':')+1,location.length).replace(" ","").toLowerCase();
console.log("Country: " + country);
console.log("Browser: " + browser);
console.log("URL: " + url);
console.log("Hostname: " + hostname);
console.log("Location: " + location);
console.log("Server: " + wpt_server);

var opts = {
    "server":wpt_server,
    "location": location,
    "runs": numRuns || 1
};

if (!/internal/.test(wpt_server)) {
    opts.key = wptAPIKey;
}

// Start the test. Once started, initiate the check-for-results-loop
wpt.runTest(url, opts, 	function (err, data) {
        console.log(data);
			test_ID = data.data.testId;
			console.log(getStatus(test_ID));
	}

);

// Keep checking that the test has finished.  Once it has, post the metrics
function getStatus(id){

	console.log('checking for test completion', id);

	var d = domain.create();

	d.on('error', function(err) {
		console.log('Something went wrong when fetching the test status', err);
	});

	d.run(function() {

		wpt.getTestStatus(id, {
			"server": wpt_server
		}, function(err, status_data){

			if(err){
				exit();
			}

			test_status = status_data.statusCode;

			console.log("Status: " + test_status);

			if(test_status==200){
				postData(id);
			}else{
				setTimeout(function(){
					getStatus(id);
				}, 5000);
			}

		});

	});
}

// Post metrics to HostedGraphite
function postData(id){

	wpt.getTestResults(id, {
		"server":wpt_server
	}, function(err, results){

		var socket = net.createConnection(2003, "carbon.hostedgraphite.com", function(err) {

			if(results.data.runs['1'].firstView != null) {
                jsonToWPT(0,"",results.data);
				socket.write(postPayload);
				socket.end();
			}else{
				exit();
			}
		});

	});

}

function exit(){
	console.log("Failed to get data back from WebPageTest.  Dropping this result set");
	process.exit(code=0)
}

function jsonToWPT(level, name, json){
    for(item in json){
        this.name = name;
        var key = item;
        var value = json[item];

        if(typeof value === 'object'){
            jsonToWPT(level + 1, name + "." + key, value);
        }
        else{
            addToGraphiteResultSet(level + 1, name + "." + key,value);
        }
    }
}

function addToGraphiteResultSet(level,name,value){
    if(level <= 3) {
        if(firstLine){
            firstLine = false;
        }else{
            postPayload += "\n";
        }
        postPayload += GraphiteAPIKey + '.webpagetest.' + hostname + "." + country + "." + browser + "." + pageType + name + " " + value;
    }
}