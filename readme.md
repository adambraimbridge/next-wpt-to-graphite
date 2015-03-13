A simple program to check in-browser performance, using WebPageTest, against the next.ft.com website and report the most important metrics to a Hosted Graphite instance.

**Usage:**
>node app.js -l browser_location -u url_to_test -p pageType -s server

**browser_location:** Where you want the browser to run.  Choices can be found at the WebPageTest instance's "locations" page: {host}/getLocations.php?f=xml.

**url_to_test:** The actual url being tested by WebPageTest.  Make sure to add the protocol (http://)

**pageType:** What kind of page is being tested.  This helps keep metrics separated in Graphite.  For example, if you enter `article` for a pageType, then the assocated metric in Graphite will be something like `webpagetest.next.ft.com.europe.chrome.article.firstrun...`

**server:** Which WebPageTest server you want to use.  If it's 
Make sure you have the following environment variables defined:
 - WPT_LOCATION <- the hostname of your WebPageTest server
 - HOSTEDGRAPHITE_APIKEY <- your Graphite API key

Results are sent to a hosted graphite page https://www.hostedgraphite.com/app/
