/**
 * Created by Zhengfeng.Yao on 16/9/23.
 */
import path from 'path';

module.exports = config => {
  config.set({
    basePath: path.resolve(process.cwd(), '.'),
    browsers: [ 'PhantomJS' ],
    captureTimeout: 60000,
    frameworks: [ 'mocha', 'chai' ],
    client: {
      mocha: {}
    },
    reporters: [ 'mocha', 'coverage' ],
    webpack: webpackConfig,
  });
};
