/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import path from 'path';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import AssetsPlugin from 'assets-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import { isValid, loadAegisConfig, getBabelConfig } from './utils';

const cwd = process.cwd();

export function getBaseConfig(dev, verbose, autoprefixer) {
  autoprefixer = autoprefixer || [
      'last 2 versions',
      '> 1%',
      'Explorer >= 9',
    ];
  return {
    cache: !!dev,
    debug: !!dev,

    stats: {
      colors: true,
      reasons: !!dev,
      hash: !!verbose,
      version: !!verbose,
      timings: true,
      chunks: !!verbose,
      chunkModules: !!verbose,
      cached: !!verbose,
      cachedAssets: !!verbose,
    },

    plugins: [
      new ProgressBarPlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
    ],

    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.json', '.json5'],
      modulesDirectories: ['node_modules', path.join(cwd, 'node_modules'), path.join(__dirname, '../node_modules')]
    },

    resolveLoader: {
      modulesDirectories: ['node_modules', path.join(cwd, 'node_modules'), path.join(__dirname, '../node_modules')]
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
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url?limit=10000&minetype=application/font-woff'
        }, {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url?limit=10000&minetype=application/font-woff'
        }, {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url?limit=10000&minetype=application/octet-stream'
        }, {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file'
        }, {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url?limit=10000&minetype=image/svg+xml'
        }, {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          loader: 'url?limit=10000'
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
  const query = `${!!dev ? 'sourceMap&' : 'minimize&'}modules&localIdentName=[local]`;
  if (web) {
    return new ExtractTextPlugin('style', `css?${query}!${loader}`);
  } else {
    return `css/locals?${query}!${loader}`;
  }
}

export function getBabelWebpackConfig(dev, web, options, verbose) {
  return webpackMerge({
    devtool: web ? (!!dev ? 'cheap-module-eval-source-map' : false) : 'source-map',
    target: web ? 'web' : 'node',
    resolve: {
      extensions: ['', '.js', '.jsx'],
    },
    babel: getBabelConfig(),
    externals: [
      !web && function filter(context, request, cb) {
        const isExternal =
          request.match(/^[@a-z][a-z\/\.\-0-9]*$/i);
        cb(null, Boolean(isExternal));
      },
    ].filter(isValid),
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: [
            /\.es5\.js$/,
            /node_modules/
          ],
          loader: 'babel-loader',
        },
        {
          test: /\.jsx$/,
          loader: 'babel-loader',
        },
        {
          test: /\.less$/,
          loader: style(!!dev, web, 'postcss!less?sourceMap'),
        }, {
          test: /\.css$/,
          loader: style(!!dev, web, 'postcss'),
        }
      ].filter(isValid)
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': !!dev ? '"development"' : '"production"',
        __DEV__: !!dev,
        'process.env.BROWSER': web,
        __BROWSER__: web
      }),
      ...(web ? [
        new AssetsPlugin({
          path: path.join(cwd, options.output.path),
          filename: 'assets.js',
          processOutput: x => `module.exports = ${JSON.stringify(x)};`,
        }),
        new ExtractTextPlugin(!!dev ? '[name].css?[hash]' : '[name].[hash].css'),
        ...(!dev ? [
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: !!verbose,
            },
          }),
          new webpack.optimize.AggressiveMergingPlugin(),
        ] : [])
      ] : [
        new webpack.BannerPlugin('require("source-map-support").install();',
          { raw: true, entryOnly: false })
      ])
    ].filter(isValid)
  }, options);
}

export function getTSWebpackConfig(dev, web, options) {
  console.log('ts model');
}

export function getWebpackConfig(options) {
  const { dev, verbose, ts } = options;
  const aegisConfig = loadAegisConfig(dev ? '.dev' : '');
  const baseConfig = getBaseConfig(dev, verbose, aegisConfig.autoprefixer);
  const { web, node } = aegisConfig;
  const clientWebpackConfig = !web ? null : webpackMerge(baseConfig, !!ts ? getTSWebpackConfig(dev, true, web, verbose) : getBabelWebpackConfig(dev, true, web, verbose));
  const serverWebpackConfig = !node ? null : webpackMerge(baseConfig, !!ts ? getTSWebpackConfig(dev, false, node) : getBabelWebpackConfig(dev, false, node));
  return [clientWebpackConfig, serverWebpackConfig].filter(isValid);
}
