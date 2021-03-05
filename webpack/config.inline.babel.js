import webpack from 'webpack';
import { SRC, JS_SRC, DIST, LIB_NAME } from './constants';

module.exports = {
    mode: 'production',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
    },
    output: {
        filename: '[name].js',
        path: DIST,
        publicPath: './',
        library: LIB_NAME,
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/env\/node$/, './env/browser'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/workers$/, '../env/browser/workers'),
        new webpack.NormalModuleReplacementPlugin(
            /env\/node\/networkUtils$/,
            '../env/browser/networkUtils',
        ),
        new webpack.ProvidePlugin({
            Promise: ['es6-promise', 'Promise'],
        }),
    ],

    optimization: {
        minimize: false,
    },

    // ignoring Node.js imports
    node: {
        fs: 'empty',
        path: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};
