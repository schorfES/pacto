module.exports = {
	'coveragePathIgnorePatterns': [
		'node_modules/',
		'__fixtures__/',
		'dist/'
	],
	'moduleDirectories': [
		'node_modules/',
		'src/'
	],
	'setupFiles': [
		'./src/__setup__.js'
	],
	'testPathIgnorePatterns': [
		'node_modules/'
	],
	'transform': {
		'^.+\\.js$': 'babel-jest',
	}
};
