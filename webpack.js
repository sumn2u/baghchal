const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');


module.exports = {
    mode: 'development',
    entry: ['@babel/polyfill','./src/library/index.js', './src/library/scss/style.scss'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: "dist",
        filename: 'game.js'
    },
    devServer: {
        contentBase: path.join(__dirname, 'demo'),
        compress: true,
        open: true,
        hot: true,
        port: 8000,
        writeToDisk:true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                  ]
            },
            {
                test: /\.(woff|woff2|ttf|eot|svg|png|jpg)$/,
                use: [
                    {
                     loader :'file-loader',
                     options : {
                         name : '[name].[ext]'
                     }
                    }
                ]
                
            }
            
        ],
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.HotModuleReplacementPlugin()
      ],    
};