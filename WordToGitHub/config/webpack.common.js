var webpack = require('webpack');
var helpers = require('./helpers');

var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var perfectionist = require('perfectionist');

module.exports = {
    entry: {
        'assets': './src/assets.ts',
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/app.ts'
    },

    resolve: {
        extensions: ['', '.js', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['ts', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file?name=assets/[name].[ext]'
            },
            {
                test: /\.css$/,                
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
            },
            {
                test: /\.css$/,
                include: helpers.root('src', 'assets'),
                loader: 'raw'
            },
            {
                test: /^(?!.*component).*\.scss$/,
                loaders: ['style', 'css', 'resolve-url', 'postcss', 'sass']
            },
            {
                test: /\.component\.scss$/,
                loaders: ['raw', 'resolve-url', 'postcss', 'sass']
            }
        ],
        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: [
                    helpers.node_modules('node_modules/rxjs'),
                    helpers.node_modules('node_modules/@angular')
                ]
            }
        ]
    },

    postcss: function () {
        return [autoprefixer({ browsers: ['Safari >= 8', 'last 2 versions'] }), perfectionist];
    },

    externals: {
        '_': 'underscore',
        '$': 'jquery'
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['polyfills', 'assets', 'vendor', 'app'].reverse()
        }),

        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),

        new CopyWebpackPlugin([            
            {
                from: './src/assets/images',
                to: 'assets/images',
            }
        ]),
    ]
};