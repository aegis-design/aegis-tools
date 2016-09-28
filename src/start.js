/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import run from './run';
import path from 'path';
import clean from './clean';
import copy from './copy';
import NodeServer from './nodeServer';
import { loadAegisConfig } from './utils';
import Browsersync from 'browser-sync';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import WebpackDevServer from './webpackDevServer';
import { getWebpackConfig } from './webpack.config';

module.exports = async function start(options) {
  const webpackConfig = getWebpackConfig(options);
  if (options.clean) {
    const dirs = webpackConfig.map(config => config.output.path);
    await run(clean.bind(undefined, dirs));
  }
  const aegisConfig = loadAegisConfig(options.dev ? '.dev' : '');
  if (aegisConfig.copy && aegisConfig.copy.source && aegisConfig.copy.target) {
    await run(copy.bind(undefined, aegisConfig.copy, true));
  }

  const { node } = options;
  if (!node) {
    const server = new WebpackDevServer(options);
    await server.run();
  }
  if (node) {
    const server = new NodeServer(options);
    await new Promise(resolve => {
      webpackConfig.filter(x => x.target !== 'node').forEach(config => {
        if (Array.isArray(config.entry)) {
          config.entry.unshift('webpack-hot-middleware/client');
        } else if (config.entry.constructor == Object) {
          Object.keys(config.entry).forEach(key => {
            if (Array.isArray(config.entry[key])) {
              config.entry[key].unshift('webpack-hot-middleware/client');
            } else {
              config.entry[key] = ['webpack-hot-middleware/client', config.entry[key]];
            }
          });
        } else {
          config.entry = ['webpack-hot-middleware/client', config.entry];
        }

        config.plugins.push(new webpack.HotModuleReplacementPlugin());
        config.plugins.push(new webpack.NoErrorsPlugin());
        config
          .module
          .loaders
          .filter(x => x.loader.indexOf('babel') !== -1)
          .forEach(x => (x.query = { // eslint-disable-line no-param-reassign
            // Wraps all React components into arbitrary transforms
            // https://github.com/gaearon/babel-plugin-react-transform
            plugins: [
              ['react-transform', {
                transforms: [
                  {
                    transform: 'react-transform-hmr',
                    imports: ['react'],
                    locals: ['module'],
                  }, {
                    transform: 'react-transform-catch-errors',
                    imports: ['react', 'redbox-react'],
                  },
                ],
              },
              ],
            ],
          }));
      });

      const bundler = webpack(webpackConfig);
      const wpMiddleware = webpackMiddleware(bundler, {

        // IMPORTANT: webpack middleware can't access config,
        // so we should provide publicPath by ourselves
        publicPath: webpackConfig[0].output.publicPath || webpackConfig[0].output.path,

        // Pretty colored output
        stats: webpackConfig[0].stats,

        // For other settings see
        // https://webpack.github.io/docs/webpack-dev-middleware
      });
      const hotMiddlewares = bundler
        .compilers
        .filter(compiler => compiler.options.target !== 'node')
        .map(compiler => webpackHotMiddleware(compiler));

      let handleServerBundleComplete = () => {
        server.run((err, host) => {
          if (!err) {
            const bs = Browsersync.create();
            bs.init({
              ...(DEBUG ? {} : { notify: false, ui: false }),

              proxy: {
                target: host,
                middleware: [wpMiddleware, ...hotMiddlewares],
              },

              files: [path.join(source, '**/*.*')],
            }, resolve);
            handleServerBundleComplete = server.run;
          }
        });
      };

      bundler.plugin('done', () => handleServerBundleComplete());
    });
  }
};
