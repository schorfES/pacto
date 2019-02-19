module.exports = {
	presets: [
		'@babel/preset-env'
	],
	plugins: [
		'@babel/plugin-proposal-object-rest-spread',
		'@babel/plugin-syntax-dynamic-import',
	],
	env: {
		test: {
			plugins: [
				'dynamic-import-node'
			]
		}
	}
};
