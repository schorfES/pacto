.PHONY:  docs audit validate tests coverage build release


docs:
	node_modules/.bin/doctoc \
		./README.md


audit:
	# ignoring 1700 doctoc>...>trim (https://github.com/thlorenz/doctoc/pull/202)
	# ignoring 1751 live-server>...>glob-parent (https://www.npmjs.com/advisories/1751)
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


coverage:
	node_modules/.bin/codecov


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
