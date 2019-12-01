import webpack from 'webpack';
import yargs from 'yargs';
const prod = yargs.argv.prod;

module.exports = {
	module: {
		rules: [
			// {
			// 	test: /\.jsx$/,
			// 	loader: 'babel-loader',
			// 	exclude: /node_modules/,
			// 	options: {
			// 		presets: [ '@babel/preset-env', 'babel-preset-airbnb' ],
			// 		plugins: [ '@babel/plugin-syntax-dynamic-import', '@babel/plugin-transform-runtime' ]
			// 	}
			// },
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					presets: [ '@babel/preset-env', 'babel-preset-airbnb' ],
					plugins: [ '@babel/plugin-syntax-dynamic-import', '@babel/plugin-transform-runtime' ]
				}
			}
		]
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ]
	},
	mode: prod ? 'production' : 'development',
	devServer: {
		historyApiFallback: true
	},
	devtool: !prod ? 'inline-source-map' : false,
	output: {
		filename: '[name].js',
		chunkFilename: '[name].bundle.js'
	},
	externals: {
		jquery: 'jQuery',
		browser: 'browser',
		breakpoints: 'breakpoints'
	},
	plugins: [
		// Set dependencies in global scope
		// https://webpack.js.org/plugins/provide-plugin/
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			cloudinary: 'cloudinary-core',
			browser: 'browser',
			breakpoints: 'breakpoints',
			Flickity: 'flickity'
		})
	]
};
