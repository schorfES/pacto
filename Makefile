.PHONY:  docs validate tests coverage build build_sem build_umd build_min


docs:
	node_modules/.bin/doctoc \
		./README.md


validate:
	eslint \
		. \
		--ext .js


tests:
	jest \
		src \
		--coverage \
		--verbose


coverage:
	node_modules/.bin/codecov

	cat \
		./coverage/lcov.info \
		| node_modules/.bin/coveralls


build:
	node ./build.js

	jest \
		tests \
		--verbose
