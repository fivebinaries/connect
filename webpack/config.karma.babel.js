import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import { SRC, JS_SRC } from './constants';

// used in legacy tests

module.exports = {
    cache: true,
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath: '../' },
                    },
                    'css-loader',
                    'less-loader',
                ],
            },
            {
                test: /\.(png|gif|jpg)$/,
                type: 'asset/resource',
                generator: {
                    filename: './images/[name][ext]',
                },
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                type: 'asset/resource',
                generator: {
                    filename: './fonts/[name][ext]',
                },
            },
            {
                test: /\.json/,
                exclude: /node_modules/,
                type: 'asset/resource',
                generator: {
                    filename: './data/[name][ext]',
                },
            },
            {
                test: /sharedConnectionWorker/i,
                loader: 'worker-loader',
                options: {
                    worker: 'SharedWorker',
                    filename: './workers/shared-connection-worker.[contenthash].js',
                },
            },
            {
                test: /\workers\/blockbook\/index/i,
                loader: 'worker-loader',
                options: {
                    filename: './workers/blockbook-worker.[contenthash].js',
                },
            },
            {
                test: /\workers\/ripple\/index/i,
                loader: 'worker-loader',
                options: {
                    filename: './workers/ripple-worker.[contenthash].js',
                },
            },
        ],
    },

    resolve: {
        modules: [JS_SRC, 'node_modules'],
        alias: {
            'flowtype/tests/get-address': `${SRC}/flowtype/tests/get-address.js`,
            'flowtype/tests/sign-message': `${SRC}/flowtype/tests/sign-message.js`,
        },
        fallback: {
            fs: false, // ignore "fs" import in fastxpub (hd-wallet)
            path: false,
            net: false, // ignore "net" and "tls" imports in "ripple-lib"
            tls: false,
            crypto: false,
            // crypto: require.resolve('crypto-browserify'), // polyfill
            stream: require.resolve('stream-browserify'), // polyfill
        },
    },

    plugins: [
        // provide polyfills
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),

        // ignore Node.js lib from trezor-link
        new webpack.IgnorePlugin({ resourceRegExp: /iconv-loader$/ }),

        // fix utxo-lib
        // new webpack.NormalModuleReplacementPlugin(/.blake2b$/, './blake2b.js'),
        // replace trezor-connect modules
        new webpack.NormalModuleReplacementPlugin(/env\/node$/, './env/browser'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/workers$/, '../env/browser/workers'),
        new webpack.NormalModuleReplacementPlugin(
            /env\/node\/networkUtils$/,
            '../env/browser/networkUtils',
        ),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
};
