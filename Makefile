.PHONY:  docs validate tests coverage build


docs:
	node_modules/.bin/doctoc \
		./README.md


validate:
	node_modules/.bin/audit-ci  \
		--moderate

	node_modules/.bin/eslint \
		. \
		--ext .js


tests:
	node_modules/.bin/jest \
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

	node_modules/.bin/jest \
		tests \
		--verbose
