/**
 * Created by Zhengfeng.Yao on 16/9/23.
 */
import path from 'path';
import Server from 'karma/lib/server';
import open from 'open';
import { loadAegisConfig, isValid } from './utils';
import getTestWebpackConfig from './webpack.config.test';

const cwd = process.cwd();

function openReportOnBrowser(output) {
  open(`file://${path.join(cwd, output, 'index.html')}`);
}

module.exports = async function test(options) {
  process.env.NODE_ENV = 'test';
  const aegisConfig = loadAegisConfig('.test');
  const { files, output } = aegisConfig;
  const { watch, verbose, port, ts } = options;
  const webpackConfig = getTestWebpackConfig(options);
  const configFile = path.join(__dirname, 'karma.conf.js');
  const plugins = ['webpack', 'sourcemap'];
  const opts = {
    basePath: path.resolve(cwd, '.'),
    configFile,
    singleRun: !watch,
    autoWatch: !!watch,
    port: port || 8080,
    webpack: webpackConfig,
    files,
    preprocessors: files.map(file => file).reduce((result, file) => {
      result[file] = plugins;
      return result;
    }, {}),
    reporters: [ 'mocha', 'coverage' ].filter(isValid),
    coverageReporter: {
      dir: output,
      reporters: [
        { type: 'text', subdir: '.' },
        { type: 'html', subdir: '.' }
      ]
    },
    logLevel: `${!!verbose ? 'debug': 'info'}`
  };
  if (!watch) {
    await new Promise(resolve => {
      Server.start(opts, () => {
        openReportOnBrowser(output);
        resolve();
      });
    });
  } else {
    const server = new Server(opts);
    server.on('run_complete', () => {
      openReportOnBrowser(output);
    });
    await server.start();
  }
};
