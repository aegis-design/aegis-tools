/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import path from 'path';
import webpack from 'webpack';
import getTS from './ts.config';
import getBabel from './babel.config';
import webpackMerge from 'webpack-merge';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import { isValid, loadAegisConfig, loadPackage } from './utils';

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
  const target = web ? 'web' : 'node';
  const pkg = loadPackage();
  let theme = {};
  if (pkg.theme && typeof(pkg.theme) === 'string') {
    let cfgPath = pkg.theme;
    // relative path
    if (cfgPath.charAt(0) === '.') {
      cfgPath = resolve(args.cwd, cfgPath);
    }
    const getThemeConfig = require(cfgPath);
    theme = getThemeConfig();
  } else if (pkg.theme && typeof(pkg.theme) === 'object') {
    theme = pkg.theme;
  }
  const query = `{"sourceMap": true, "modifyVars": ${JSON.stringify(theme)}}`;
  return {
    devtool: web ? (!!dev ? 'cheap-module-eval-source-map' : false) : 'source-map',
    target: target,
    module: {
      loaders: [
        {
          test: /\.sass$/,
          loader: style(!!dev, web, `postcss!sass?${query}`),
        },
        {
          test: /\.scss$/,
          loader: style(!!dev, web, `postcss!sass?${query}`),
        },
        {
          test: /\.styl$/,
          loader: style(!!dev, web, `postcss!stylus?${query}`),
        },
        {
          test: /\.less$/,
          loader: style(!!dev, web, `postcss!less?${query}`),
        }, {
          test: /\.css$/,
          loader: style(!!dev, web, 'postcss'),
        }
      ].filter(isValid)
    },
    plugins: [
      !dev && new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': !!dev ? '"development"' : '"production"',
        __DEV__: !!dev,
        'process.env.BROWSER': web,
        __BROWSER__: web
      }),
      ...(web ? [
        new ExtractTextPlugin(options.fileName ? `${options.fileName}.css` : (!!dev ? '[name].css?[hash]' : '[name].[hash].css')),
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
