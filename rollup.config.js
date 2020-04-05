const babel = require('rollup-plugin-babel');


const MODULE_ID = 'pacto';
const MODULE_ENTRY = './src/index.js';

export default [
	{
		input: MODULE_ENTRY,
		output: {
			file: './dist/pacto.esm.js',
			format: 'es'
		}
	},
	{
		input: MODULE_ENTRY,
		output: {
			file: './dist/pacto.umd.js',
			name: MODULE_ID,
			format: 'umd'
		},
		plugins: [babel()]
	},
	{
		input: MODULE_ENTRY,
		output: {
			file: './dist/pacto.min.js',
			name: MODULE_ID,
			format: 'umd'
		},
		plugins: [babel()]
	}
];
