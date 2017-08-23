'use strict';

const path = require('path');

module.exports = {
    entry: {
        login: './src/app/Login.tsx'
    },
    output: {
        path: path.resolve('./dist'),
        filename: 'app/[name].js'
    },
    devtool: 'source-map',
    target: 'electron',
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, 'src')],
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.tsx$/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: 'src/app/tsconfig.json'
                }
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    }
};
