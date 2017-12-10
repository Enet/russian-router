const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    module: {
        rules: [{
            test: /\.js$/,
            use: 'babel-loader'
        }]
    },
    output: {
        filename: 'dist/russian-router.js',
        libraryTarget: 'umd',
        library: 'RussianRouter',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        })
    ]
};
