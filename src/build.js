/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import run from './run';
import clean from './clean';
import bundle from './bundle';
import { getWebpackConfig } from './webpack.config';

module.exports = async function build(options) {
  if (options.clean) {
    const webpackConfig = getWebpackConfig(options);
    const dirs = webpackConfig.map(config => config.output.path);
    await run(clean.bind(undefined, dirs));
  }
  await run(bundle.bind(undefined, options));
};
