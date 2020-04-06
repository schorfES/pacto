const babel = require('rollup-plugin-babel');
const terser =require('rollup-plugin-terser').terser;


const MODULE_NAME = 'pacto';
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
			file: './dist/pacto.cjs.js',
			name: MODULE_NAME,
			format: 'cjs'
		},
		plugins: [babel()]
	},
	{
		input: MODULE_ENTRY,
		output: {
			file: './dist/pacto.min.js',
			name: MODULE_NAME,
			format: 'iife'
		},
		plugins: [babel(), terser()]
	},
];
