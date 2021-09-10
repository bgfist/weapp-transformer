const path = require('path');
const TaroMcTransformPlugin = require('../../lib/webpack/TaroMcTransformPlugin');

/** @type {import('webpack').Configuration} */
module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        'index.wxml': './src/index.wxml',
        'index.js': './src/index.js',
        'index.wxss': './src/index.wxss'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]'
    },
    module: {
        rules: [
            {
                test: /\.wxml|\.wxss$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        useRelativePath: true,
                        name: `[path][name].[ext]`
                    }
                }
            }
        ]
    },
    plugins: [
        new TaroMcTransformPlugin({
            platform: 'baidu'
        })
    ]
}