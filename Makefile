.PHONY:  docs validate tests coverage build release


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


build:
	node ./build.js

	node_modules/.bin/jest \
		tests \
		--verbose


make release: validate tests build docs
	node_modules/.bin/bump \
		--commit "Release v%s" \
		--tag "%s" \
		--all
