A simple program to check in-browser performance, using WebPageTest, against the next.ft.com website and report the most important metrics to a Hosted Graphite instance.

##Usage

For a single page:

```
node index.js -u <url> -p <pageType>
```

Or for a group of pages listed in a JSON file:

```
node index.js -b <file>
```

###Options

Option  | Description                        | Default
--------|------------------------------------|--------
`-r`    | Number of runs                     | `1`
`-w`    | Wait time (in s) between polls     | `5`
`-t`    | Timeout (in s)                     | `180`
`-s`    | Testing server URL                 | `www.webpagetest.org`
`-l`    | Test location and browser          | `Dulles:Chrome`
`-v`    | Verbose logging                    | `true`
`-a`    | Average to use (average or median) | `median`

##Setup

Make sure you have the following environment variables defined:

 - `HOSTEDGRAPHITE_APIKEY` Your Graphite API key
 - `WPT_APIKEY` Your WPT Key (if using the public servers)

Results are sent to a hosted graphite page: https://www.hostedgraphite.com/app/
