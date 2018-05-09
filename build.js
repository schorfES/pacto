const babel = require('babel-core');
const fs = require('fs');
const rollup = require('rollup');
const uglifyjs = require('uglify-js');


const MODULE_ID = 'pacto';
const MODULE_ENTRY = './src/index.js';


[
	{
		file: './dist/pacto.esm.js',
		rollup: {
			input: MODULE_ENTRY,
			output: {format: 'es'}
		},
		babel: false,
		uglify: false
	},
	{
		file: './dist/pacto.umd.js',
		rollup: {
			input: MODULE_ENTRY,
			output: {format: 'es'}
		},
		babel: {
			filename: MODULE_ENTRY,
			moduleId: MODULE_ID,
			plugins: ['transform-es2015-modules-umd'],
		},
		uglify: false
	},
	{
		file: './dist/pacto.min.js',
		rollup: {
			input: MODULE_ENTRY,
			output: {format: 'es'}
		},
		babel: {
			filename: MODULE_ENTRY,
			moduleId: MODULE_ID,
			plugins: ['transform-es2015-modules-umd'],
		},
		uglify: {}
	}
].forEach(async target => {
	const bundler = await rollup.rollup(target.rollup);
	let {code} = await bundler.generate(target.rollup.output);
	code = await transpile(code, target.babel);
	code = await uglify(code, target.uglify);

	fs.writeFileSync(target.file, code);
});

async function transpile(code, options) {
	if (!(typeof options === 'object')) {
		return code;
	}

	return babel.transform(code, options).code;
}

async function uglify(code, options) {
	if (!(typeof options === 'object')) {
		return code;
	}

	return uglifyjs.minify(code, options).code;
}
