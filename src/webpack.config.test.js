/**
 * Created by Zhengfeng.Yao on 16/9/23.
 */
import path from 'path';
import webpackMerge from 'webpack-merge';
import { loadAegisConfig, isValid, getBabelConfig } from './utils';

const cwd = process.cwd();

function resolvePaths(input){
  if (input) {
    if (typeof input == 'string') {
      return [path.join(cwd, input)];
    }

    if (Array.isArray(input)) {
      return input.map(src => path.join(cwd, src));
    }
  }

  return [];
}

export default function getTestWebpackConfig(options) {
  const config = loadAegisConfig('.test');
  const { ts } = options;
  const { src, testPath } = config;
  return webpackMerge({
    devtool: 'eval',

    resolve: {
      root: path.resolve(cwd, '.'),
      extensions: ['', '.webpack.js', '.web.js', ...(!ts ? ['.js', '.jsx'] : ['.ts', '.tsx']), '.json'],
      modulesDirectories: ['node_modules', path.join(cwd, 'node_modules'), path.join(__dirname, '../node_modules')]
    },

    resolveLoader: {
      modulesDirectories: ['node_modules', path.join(cwd, 'node_modules'), path.join(__dirname, '../node_modules')]
    },

    babel: getBabelConfig(),

    module: {
      preLoaders: [
        !ts && {
          test: /\.(js|jsx)$/,
          loader: 'isparta-instrumenter-loader',
          include: resolvePaths(src)
        }
      ].filter(isValid),
      loaders: [
        !ts && {
          test: /\.jsx?$/,
          include: [
            ...resolvePaths(src),
            ...resolvePaths(testPath),
          ].filter(isValid),
          exclude: /\.es5\.js$/,
          loader: 'babel-loader',
        }, {
          test: /\.json$/,
          loader: 'json-loader',
        }, {
          test: /\.json5$/,
          loader: 'json5-loader',
        }, {
          test: /\.(woff\d?|ttf|eot|svg|jpe?g|png|gif|txt)(\?.*)?$/,
          loader: 'null-loader',
        }, {
          test: /\.est$/,
          loader: 'babel-loader!template-string-loader'
        }
      ].filter(isValid),
    },
  }, config.webpack);
};
