.PHONY:  docs audit validate tests build release


docs:
	node_modules/.bin/doctoc \
		./README.md

	node_modules/.bin/jsdoc \
		--configure ./jsdoc.json \
		--verbose


audit:
	# ignoring 1700 doctoc>...>trim (https://github.com/thlorenz/doctoc/pull/202)
	node_modules/.bin/audit-ci  \
		--moderate \
		--allowlist 1700 \
		--allowlist 1751


validate:
	node_modules/.bin/eslint \
		. \
		--ext .js


tests:
	node_modules/.bin/jest \
		src \
		--coverage \
		--verbose


build:
	node_modules/.bin/browserslist \
		--update-db

	node_modules/.bin/rollup \
		-c \
		--environment INCLUDE_DEPS,BUILD:production

	node_modules/.bin/jest \
		tests \
		--verbose


make release: validate tests build docs
	node_modules/.bin/np \
		--no-yarn \
		--no-tests \
		--tag
