/**
  * Created by Zhengfeng Yao on 16/9/21.
  */
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

const cwd = process.cwd();

export function isValid(x) {
  return !!x;
}

export function loadPackage() {
  return require(path.resolve(cwd, 'package.json'));
}

export function savePackage(pkg) {
  const fn = path.join(cwd, 'package.json');
  fs.writeFileSync(fn, JSON.stringify(pkg, null, ' '), {encoding: 'utf8'});
}

export function loadAegisConfig(prefix) {
  try {
    require('babel-register')(getBabelConfig());
    return require(path.resolve(cwd, `aegis.config${prefix || ''}`));
  } catch(_) {
    console.log(_);
    return {};
  }
}

export function getBabelConfig() {
  return {
    presets: [
      require.resolve('babel-preset-es2015-ie'),
      require.resolve('babel-preset-react'),
      require.resolve('babel-preset-stage-0'),
      require.resolve('babel-preset-stage-1'),
    ],
    plugins: [
      require.resolve('babel-plugin-transform-runtime'),
      require.resolve('babel-plugin-transform-decorators-legacy'),
    ],
  };
}

export function makeDir(name) {
  return new Promise((resolve, reject) => {
    mkdirp(name, err => err ? reject(err) : resolve());
  });
}
