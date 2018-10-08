// This is the webpack config used for unit tests.

var merge = require('webpack-merge')
var baseConfig = require('./webpack.config.js')

var webpackConfig = merge(baseConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  devtool: '#inline-source-map'
})

module.exports = webpackConfig
