/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import path from 'path';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import AssetsPlugin from 'assets-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import { isValid, loadAegisConfig } from './utils';

const cwd = process.cwd();

export function getBaseConfig(dev, verbose, autoprefixer) {
  autoprefixer = autoprefixer || [
      'Chrome >= 35',
      'Firefox >= 31',
      'Explorer >= 9',
      'Opera >= 12',
      'Safari >= 7.1',
    ];
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
      extensions: ['', '.webpack.js', '.web.js', '.json', '.json5'],
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

function style(dev, web, loader) {
  const query = `${dev ? 'sourceMap&' : 'minimize&'}modules&localIdentName=[local]`;
  if (web) {
    return new ExtractTextPlugin('style', `css?${query}!${loader}`);
  } else {
    return `css/locals?${query}!${loader}`;
  }
}

export function getBabelWebpackConfig(dev, web, options, verbose) {
  console.log('babel model');
  return {
    entry: options.entry,
    output: options.output,
    devtool: web ? (dev ? 'cheap-module-eval-source-map' : false) : 'source-map',
    target: web ? 'web' : 'node',
    resolve: {
      extensions: ['', '.js', '.jsx'],
    },
    externals: [
      !web && function filter(context, request, cb) {
        const isExternal =
          request.match(/^[@a-z][a-z\/\.\-0-9]*$/i);
        cb(null, Boolean(isExternal));
      },
      ...(options.externals ? options.externals : [])
    ].filter(isValid),
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          include: [
            path.resolve(cwd, 'src'),
          ],
          exclude: /\.es5\.js$/,
          loader: `${dev ? '' : 'es3ify'}!babel-loader`,
        },
        {
          test: /\.less$/,
          loader: style(dev, web, 'postcss!less'),
        }, {
          test: /\.css$/,
          loader: style(dev, web, 'postcss'),
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': dev ? '"development"' : '"production"',
        __DEV__: dev,
        'process.env.BROWSER': web,
        __BROWSER__: web
      }),
      ...(web ? [
        new AssetsPlugin({
          path: path.join(cwd, options.output.path),
          filename: 'assets.js',
          processOutput: x => `module.exports = ${JSON.stringify(x)};`,
        }),
        options.extractCommon && new webpack.optimize.CommonsChunkPlugin(options.extractCommon),
        new ExtractTextPlugin(dev ? '[name].css?[hash]' : '[name].[hash].css'),
        ...(!dev ? [
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              screw_ie8: true,
              warnings: verbose,
            },
          }),
          new webpack.optimize.AggressiveMergingPlugin(),
        ] : [])
      ] : [
        new webpack.BannerPlugin('require("source-map-support").install();',
          { raw: true, entryOnly: false })
      ])
    ].filter(isValid)
  };
}

export function getTSWebpackConfig(dev, web, options) {
  console.log('ts model');
}

export function getWebpackConfig(options) {
  const { dev, verbose, ts } = options;
  const aegisConfig = loadAegisConfig(dev);
  const baseConfig = getBaseConfig(dev, verbose, aegisConfig.autoprefixer);
  const { web, node } = aegisConfig;
  const clientWebpackConfig = !web ? null : webpackMerge(baseConfig, !!ts ? getTSWebpackConfig(dev, true, web, verbose) : getBabelWebpackConfig(dev, true, web, verbose));
  const serverWebpackConfig = !node ? null : webpackMerge(baseConfig, !!ts ? getTSWebpackConfig(dev, false, node) : getBabelWebpackConfig(dev, false, node));
  return [clientWebpackConfig, serverWebpackConfig].filter(isValid);
}
