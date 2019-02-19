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
	],
	'testPathIgnorePatterns': [
		'node_modules/'
	],
	'transform': {
		'^.+\\.js$': 'babel-jest',
	}
};
