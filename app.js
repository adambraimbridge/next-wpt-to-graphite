var WebPageTest = require('webpagetest');
var http = require('http');
var fs = require('fs');
var net = require('net');
var argv = require('minimist')(process.argv.slice(2));
var domain = require('domain');

var wpt = new WebPageTest();
var test_ID;
var test_status;
var apiKey = process.env.HOSTEDGRAPHITE_APIKEY;
var wpt_server = process.env.WPT_LOCATION;
var location = argv.l;
var pageType = argv.p;
var url;
var browser;
var country;
var postPayload = "";
var firstLine = true;


// Set url based on command line parameters (defaults to article page)
if(pageType == 'article'){
	url = 'next.ft.com/380e7966-b07f-11e4-9b8e-00144feab7de';
}else if(pageType == 'homepage'){
	url = 'next.ft.com'
}else if(typeof pageType == 'undefined'){
	url = 'next.ft.com/380e7966-b07f-11e4-9b8e-00144feab7de';
	pageType = 'article';
}
console.log("URL: " + url);
console.log("PageType: " + pageType);

// Set a base location if one isn't provided
if(typeof location == 'undefined'){
	console.log('Missing required browser location parameter.  Correct usage is "node app.js browser_location {pageType}""');
	return 'error';
}

// get Country and Browser metrics from the location
country = location.substring(0,location.indexOf('_'));
browser = location.substring(location.lastIndexOf(':')+1,location.length).replace(" ","");
console.log("Country: " + country);
console.log("Browser: " + browser);

// Start the test. Once started, initiate the check-for-results-loop
wpt.runTest(url, {
		"server":wpt_server,
		"location":location
	}, 	function (err, data) {
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
        postPayload += apiKey + '.webpagetest.next.' + country + '.' + browser + '.' + pageType + name + " " + value;
    }
}