/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import webpack from 'webpack';
import { getWebpackConfig } from './webpack.config';

module.exports = function bundle(options) {
  return new Promise((resolve, reject) => {
    const webpackConfig = getWebpackConfig(options);
    const finished = (err, stats) => {
      if (err) {
        console.log(err);
        return reject(err);
      }

      console.log(stats.toString(webpackConfig[0].stats));
      return resolve();
    };
    if (options.watch) {
      webpack(webpackConfig).watch({}, finished);
    } else {
      webpack(webpackConfig).run(finished);
    }
  });
};
