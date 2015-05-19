clean:
	git clean -fxd

install:
	npm install

test:
	nbt verify --skip-layout-checks

run:
	node index.js -b tests.json -s webpagetest.internal.ft.com -r 3 -t 3600

download-ci-config:
	curl -X GET http://ftjen06392-lvpr-uk-p.osb.ft.com:8181/job/webpage-test-to-graphite/config.xml -o .jenkins.xml

upload-ci-config:
	curl -X POST http://ftjen06392-lvpr-uk-p.osb.ft.com:8181/job/webpage-test-to-graphite/config.xml --data-binary "@.jenkins.xml"
