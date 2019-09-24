const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');



module.exports = (env) => {
    return {
        mode: env || 'development',
        entry: ['./src/library/index.js', './src/library/scss/style.scss'],
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js'
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            open: true,
            hot: true,
            port: 3002||process.env.port,
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
                    test: /\.(woff|woff2|ttf|eot|mp3)$/,
                    use: [
                        {
                        loader :'file-loader',
                        options : {
                            name: '[hash]-[name].[ext]'
                            
                        }
                        }
                    ]
                    
                },
                {
                    test: /\.(png|jp(e*)g|svg)$/,  
                    use: [{
                        loader: 'url-loader',
                        options: { 
                            limit: 8000, // Convert images < 8kb to base64 strings
                            name: 'images/[hash]-[name].[ext]'
                        } 
                    }]
                }
                
            ],
        },
        plugins: [
            
            new CleanWebpackPlugin(['dist']),
            new webpack.HotModuleReplacementPlugin(),
            new HtmlWebpackPlugin({
                title: 'Bagh Chal',
                template: './src/index.html',
                env: env || 'development'
            }),
            new CopyPlugin([{
                from: 'fbapp-config.json',
                to: 'fbapp-config.json'
            }]),
             new CopyPlugin([{
                 from: 'bagchal.mp3',
                 to: 'bagchal.mp3'
             }])
        ],  
    }  
};