/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import path from 'path';
import chalk from 'chalk';
import webpack from 'webpack';
import getTS from './ts.config';
import getBabel from './babel.config';
import webpackMerge from 'webpack-merge';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import FlowStatusWebpackPlugin from 'flow-status-webpack-plugin';
import { isValid, loadAegisConfig } from './utils';

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

    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
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
    return ExtractTextPlugin.extract('style', `css?${query}!${loader}`);
  } else {
    return `css/locals?${query}!${loader}`;
  }
}

function getCommonWebpackConfig(dev, web, options, verbose) {
  return {
    devtool: web ? (!!dev ? 'cheap-module-eval-source-map' : false) : 'source-map',
    target: web ? 'web' : 'node',
    // externals: [
    //   !web && function filter(context, request, cb) {
    //     const isExternal =
    //       request.match(/^[@a-z][a-z\/\.\-0-9]*$/i);
    //     cb(null, Boolean(isExternal));
    //   },
    // ].filter(isValid),
    module: {
      loaders: [
        {
          test: /\.sass$/,
          loader: style(!!dev, web, 'postcss!sass?sourceMap'),
        },
        {
          test: /\.scss$/,
          loader: style(!!dev, web, 'postcss!sass?sourceMap'),
        },
        {
          test: /\.styl$/,
          loader: style(!!dev, web, 'postcss!stylus?sourceMap'),
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
    resolve: {
      extensions: ['.css', '.less', '.sass', '.scss', '.styl']
    },
    plugins: [
      !dev && new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': !!dev ? '"development"' : '"production"',
        __DEV__: !!dev,
        'process.env.BROWSER': web,
        __BROWSER__: web
      }),
      new FlowStatusWebpackPlugin({
        failOnError: true,
        onSuccess: () => console.log(chalk.bold.green('Flow check success!')),
        onError: () => {
          console.log(chalk.bold.red('Flow check failed!'));
          return false;
        }
      }),
      ...(web ? [
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
  };
}

export function getBabelWebpackConfig() {
  return {
    resolve: {
      extensions: ['', '.js', '.jsx'],
    },
    babel: getBabel(),
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
          test: /\.est$/,
          loader: 'babel-loader!template-string-loader'
        }
      ]
    },
  };
}

export function getTSWebpackConfig() {
  return {
    resolve: {
      extensions: ['', '.ts', '.tsx', '.js'],
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          exclude: /\.jsx?$/,
          loader: 'babel!ts',
        },
        {
          test: /\.est$/,
          loader: 'ts!template-string-loader'
        }
      ]
    },
    babel: getBabel(),
    ts: getTS()
  };
}

function genConfig(dev, web, options, verbose, ts) {
  const commonConfig = getCommonWebpackConfig(dev, web, options, verbose);
  const extendConfig = !!ts ? getTSWebpackConfig() : getBabelWebpackConfig();
  return webpackMerge(commonConfig, extendConfig, options);
}

export function getWebpackConfig(options) {
  const { dev, verbose, ts } = options;
  const aegisConfig = loadAegisConfig(dev ? '.dev' : '');
  const baseConfig = getBaseConfig(dev, verbose, aegisConfig.autoprefixer);
  const { web, node } = aegisConfig;
  if (!web && !node) {
    console.log('Do not find client or node config.');
    return [];
  }
  const webpackConfigs = [];
  if (web) {
    webpackConfigs.push(webpackMerge(baseConfig, genConfig(dev, true, web, verbose, ts)));
  }
  if (node) {
    webpackConfigs.push(webpackMerge(baseConfig, genConfig(dev, false, node, verbose, ts)));
  }
  return webpackConfigs;
}
