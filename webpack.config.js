const webpack = require('webpack');
const glob = require('glob');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const PRODUCTION = process.env.NODE_ENV === 'production';
const DEBUG = process.env.NODE_ENV !== 'production';

module.exports = {

  entry: {
    index: './index.ts',
    specs: './specs/index.ts',
  },

  target: PRODUCTION ? 'node' : 'web',
  externals: PRODUCTION ? [nodeExternals()] : [],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },

  stats: {
    colors: true
  },

  resolve: {
    extensions: ['', '.ts', '.js'],
    root: [
      path.join(__dirname, 'lib'),
      path.join(__dirname, 'node_modules')
    ],
    modulesDirectories: ['node_modules'],
  },

  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' },
    ]
  },

  ts: {
    configFileName: './tsconfig.json'
  },

  plugins: [
  ].concat(PRODUCTION ? [
    // additional pluginds for PRODUCTION target
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ] : []).concat(DEBUG ? [
    // additional pluginds for DEBUG target
    new webpack.SourceMapDevToolPlugin()
  ] : [])
}