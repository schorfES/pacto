const path = require('path');


module.exports ={
	mode: 'production',
	entry: './src/index.js',
	output: {
		filename: 'pacto.min.js',
		path: path.resolve(__dirname, 'dist'),
		library: 'pacto',
		libraryTarget: 'umd'
	},
	module: {
		rules: [{
			test: /\.js$/,
			use: [{loader: 'babel-loader'}]
		}]
	}
};
