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

export function loadAegisConfig() {
  const fn = path.join(cwd, 'aegis.config.js');
  try {
    return require(fn);
  } catch(_) {
    return {};
  }
}

export function makeDir(name) {
  return new Promise((resolve, reject) => {
    mkdirp(name, err => err ? reject(err) : resolve());
  });
}
