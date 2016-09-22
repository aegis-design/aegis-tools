/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import webpack from 'webpack';
import { getWebpackConfig } from './utils';

module.exports = function bundle(options) {
  return new Promise((resolve, reject) => {
    const webpackConfig = getWebpackConfig(options);
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      console.log(stats.toString(webpackConfig[0].stats));
      return resolve();
    });
  });
};
