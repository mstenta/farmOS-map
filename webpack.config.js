const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const info = require('./package.json');

module.exports = {
  entry: `${__dirname}/src/main.js`,
  output: {
    path: `${__dirname}/build`,
    filename: 'farmOS-map.js',
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin(`farmOS-map v${info.version}`),
    new CopyWebpackPlugin([
      { from: 'static' },
    ]),
    new WorkboxPlugin.GenerateSW(),
  ],
};
