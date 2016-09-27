/**
 * Created by Zhengfeng.Yao on 16/9/23.
 */
import path from 'path';
import getTS from './ts.config';
import getBabel from './babel.config';
import webpackMerge from 'webpack-merge';
import { loadAegisConfig, isValid } from './utils';

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

    babel: getBabel(),
    ts: getTS(),

    module: {
      preLoaders: [
        !ts && {
          test: /\.(js|jsx)$/,
          loader: 'isparta-instrumenter-loader',
          include: resolvePaths(src)
        },
        ts && {
          test: /\.(ts|tsx)$/,
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
        }, !ts && {
          test: /\.est$/,
          loader: 'babel-loader!template-string-loader'
        }, ts && {
          test: /\.tsx?$/,
          include: [
            ...resolvePaths(src),
            ...resolvePaths(testPath),
          ].filter(isValid),
          loader: 'babel-loader',
        }, ts && {
          test: /\.est$/,
          loader: 'ts-loader!template-string-loader'
        }, {
          test: /\.json$/,
          loader: 'json-loader',
        }, {
          test: /\.json5$/,
          loader: 'json5-loader',
        }, {
          test: /\.(woff\d?|ttf|eot|svg|jpe?g|png|gif|txt)(\?.*)?$/,
          loader: 'null-loader',
        }
      ].filter(isValid),
    },
  }, config.webpack);
};
