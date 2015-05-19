clean:
	git clean -fxd

install:
	npm install

test:
	nbt verify --skip-layout-checks

run:
	node index.js -b tests.json -r 3 -t 600 -s webpagetest.internal.ft.com
