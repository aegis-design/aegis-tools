/**
 * Created by Zhengfeng.Yao on 16/9/27.
 */
export default function getBabel() {
  return {
    presets: [
      require.resolve('babel-preset-es2015-ie'),
      require.resolve('babel-preset-react'),
      require.resolve('babel-preset-stage-0'),
      require.resolve('babel-preset-stage-1'),
    ],
    plugins: [
      require.resolve('babel-plugin-transform-decorators-legacy'),
      require.resolve('babel-plugin-transform-runtime'),
      require.resolve('babel-plugin-transform-flow-strip-types')
    ],
  };
}
