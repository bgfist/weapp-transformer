const path = require('path');
const { TaroMcTransformPlugin } = require('../../lib/webpack/TaroMcTransformPlugin');

/** @type {import('webpack').Configuration} */
module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'none',
    entry: {
        'index.axml.js': './index.wxml',
        'index.js': './index.js',
        'index.acss.js': './index.wxss',
        'index.sjs.js': './index.wxs',
        'inner/index.axml.js': './inner/index.wxml',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]'
    },
    module: {
        rules: [
            {
                test: /\.(wxml|wxss|wxs)$/,
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
            platform: 'alipay'
        })
    ]
}