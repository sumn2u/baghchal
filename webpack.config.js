const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {
  const isProduction = env && env.production;

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/library/index.js', // main JS entry
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      assetModuleFilename: 'assets/[hash][ext][query]',
      clean: true,
    },
    devServer: {
      static: path.join(__dirname, 'dist'),
      compress: true,
      open: true,
      hot: true,
      port: process.env.PORT || 5001,
      devMiddleware: { writeToDisk: true },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } },
        },
        {
          test: /\.scss$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  silenceDeprecations: [
                    'legacy-js-api',
                    'import',
                    'function-units',
                    'slash-div',
                    'global-builtin'
                  ]
                }
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|woff2?|ttf|eot|mp3)$/i,
          type: 'asset/resource',
          parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
          use: ['image-webpack-loader'],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css',
        chunkFilename: '[id].[contenthash].css',
      }),
      // new webpack.DefinePlugin({
      //   'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      // }),
      new HtmlWebpackPlugin({
        title: 'Bagh Chal',
        template: './src/index.html',
        env: isProduction ? 'production' : 'development',
        inject: 'body',
        scriptLoading: 'defer',
      }),
      new CopyPlugin({
        patterns: [
          { from: 'fbapp-config.json' },
          { from: 'bagchal.mp3' }
        ],
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 4 * 1024 * 1024,
      maxAssetSize: 4 * 1024 * 1024,
    },
  };
};


