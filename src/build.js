/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import run from './run';
import copy from './copy';
import clean from './clean';
import bundle from './bundle';
import { loadAegisConfig } from './utils';
import { getWebpackConfig } from './webpack.config';

module.exports = async function build(options) {
  if (options.clean) {
    const webpackConfig = getWebpackConfig(options);
    const dirs = webpackConfig.map(config => config.output.path);
    await run(clean.bind(undefined, dirs));
  }
  const config = loadAegisConfig(options.dev ? '.dev' : '');
  if (config.copy && config.copy.source && config.copy.target) {
    await run(copy.bind(undefined, config.copy, options));
  }
  await run(bundle.bind(undefined, options));
};
