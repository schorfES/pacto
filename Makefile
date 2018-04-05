build: build_esm build_umd build_min


build_esm:
	node_modules/.bin/rollup \
		src/index.js \
		--format es \
		--file dist/pacto.esm.js


build_umd:
	node_modules/.bin/rollup \
		src/index.js \
		--format umd \
		--name 'pacto' \
		--file dist/pacto.umd.js

	# @TODO: babel converts umd's this into undefined
	node_modules/.bin/babel \
		dist/pacto.umd.js \
		--out-file dist/pacto.umd.js


build_min:
	node_modules/.bin/rollup \
		src/index.js \
		--format umd \
		--name 'pacto' \
		--file dist/pacto.min.js

	# @TODO: babel converts umd's this into undefined
	node_modules/.bin/babel \
		dist/pacto.min.js \
		--out-file dist/pacto.min.js

	node_modules/.bin/uglifyjs \
		dist/pacto.min.js \
		--compress \
		--mangle \
		--output dist/pacto.min.js
