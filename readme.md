A simple program to check in-browser performance, using WebPageTest, against the next.ft.com website and report the most important metrics to a Hosted Graphite instance.

**Usage:**
>node app.js -l browser_location { -p pageType}

**browser_location:** Where you want the browser to run.  Choices can be found at the WebPageTest instance's "locations" page: {host}/getLocations.php?f=xml.

**pageType(optional):** Current choices are "article" or "homepage".  If no parameter is specified, it will default to "article".

Make sure you have the following environment variables defined:
 - WPT_LOCATION <- the hostname of your WebPageTest server
 - HOSTEDGRAPHITE_APIKEY <- your Graphite API key

Results are sent to a hosted graphite page https://www.hostedgraphite.com/app/
