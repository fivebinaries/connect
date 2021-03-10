import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { SRC, HTML_SRC, JS_SRC, LIB_NAME, PORT, DIST } from './constants';

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
        iframe: `${JS_SRC}iframe/iframe.js`,
        popup: `${JS_SRC}popup/popup.js`,
        webusb: `${JS_SRC}webusb/index.js`,
        extensionPermissions: `${JS_SRC}webusb/extensionPermissions.js`,
    },
    output: {
        path: DIST,
        publicPath: './',
        library: LIB_NAME,
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    devServer: {
        contentBase: SRC,
        hot: false,
        https: true,
        port: PORT,
        inline: true,
    },
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
        modules: [SRC, 'node_modules'],
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
    performance: {
        hints: false,
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

        new HtmlWebpackPlugin({
            chunks: ['iframe'],
            filename: 'iframe.html',
            template: `${HTML_SRC}iframe.html`,
            inject: false,
        }),
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            filename: 'popup.html',
            template: `${HTML_SRC}popup.html`,
            inject: false,
        }),
        new HtmlWebpackPlugin({
            chunks: ['webusb'],
            filename: 'webusb.html',
            template: `${HTML_SRC}webusb.html`,
            inject: true,
        }),
        new HtmlWebpackPlugin({
            chunks: ['extensionPermissions'],
            filename: 'extension-permissions.html',
            template: `${HTML_SRC}extension-permissions.html`,
            inject: true,
        }),
    ],

    optimization: {
        emitOnErrors: true,
        moduleIds: 'named',
    },
};
