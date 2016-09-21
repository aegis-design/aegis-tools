/**
  * Created by Zhengfeng Yao on 16/9/21.
  */
import webpack from 'webpack';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import path from 'path';
import fs from 'fs';

const cwd = process.cwd();

export function loadPackage() {
  return require(path.resolve(cwd, 'package.json'));
}

export function savePackage(pkg) {
  const fn = path.join(cwd, 'package.json');
  fs.writeFileSync(fn, JSON.stringify(pkg, null, ' '), {encoding: 'utf8'});
}

export function loadAegisConfig() {
  const fn = path.join(cwd, 'aegis.config.js');
  try {
    return require(fn);
  } catch(_) {
    return {};
  }
}

export function getBaseConfig(dev, verbose, autoprefixer) {
  return {
    cache: dev,
    debug: dev,

    stats: {
      colors: true,
      reasons: dev,
      hash: verbose,
      version: verbose,
      timings: true,
      chunks: verbose,
      chunkModules: verbose,
      cached: verbose,
      cachedAssets: verbose,
    },

    plugins: [
      new ProgressBarPlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
    ],

    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],
    },

    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json-loader',
        }, {
          test: /\.json5$/,
          loader: 'json5-loader',
        }, {
          test: /\.txt$/,
          loader: 'raw-loader',
        }, {
          test: /\.(svg|jpe?g|png|gif)(\?.*)?$/,
          loader: 'url-loader?limit=10000',
        }, {
          test: /\.(woff\d?|ttf|eot)(\?.*)?$/,
          loader: 'file-loader',
        }, {
          test: /\.est$/,
          loader: 'babel-loader!template-string-loader'
        }
      ],
    },

    postcss: () => {
      return [
        require('postcss-nested')(),
        require('pixrem')(),
        require('autoprefixer')(autoprefixer),
        require('postcss-flexibility')(),
        require('postcss-discard-duplicates')()
      ];
    },
  }
}
