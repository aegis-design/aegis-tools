/**
  * Created by Zhengfeng Yao on 16/9/21.
  */
import path from 'path';
import fs from 'fs';

function loadConfig(cwd) {
  const fn = path.join(cwd, 'aegis.config.js');
  try {
    return require(fn);
  } catch(_) {
    return {};
  }
}

function loadPackage(cwd) {
  const fn = path.join(cwd, 'package.json');
  return require(fn);
}

function savePackage(cwd, pkg) {
  const fn = path.join(cwd, 'package.json');
  fs.writeFileSync(fn, JSON.stringify(pkg, null, ' '), {encoding: 'utf8'});
}

function transform(entries, f) {
  let dirty = false;
  entries.forEach(entry => {
    if(entry) {
	  Object.keys(entry).forEach(key => {
	    const value = entry[key];
		const n = f(key, value);
		if (n && n !== value) {
		  entry[key] = n;
		  console.log(`${key} ${n}`);
		  dirty = true;
		}
	  });
	}
  });
  return dirty;
}

exports.freeze = function freeze() {
  return new Promise(resolve => {
    const cwd = process.cwd();
    const pkg = loadPackage(cwd);
    const dirty = transform([pkg.dependencies, pkg.devDependencies], (name, version) => {
      const mo = version.match(/^(?:[\^|\~])|(?:\>=?\s*)/);
  	if (mo) {
  	  return version.slice(mo[0].length);
  	}
    });
    if(dirty) {
      savePackage(cwd, pkg);
    }
    resolve();
  });
}

exports.unfreeze = function unfreeze(options) {
  return new Promise(resolve => {
    const cwd = process.cwd();
    const config = loadConfig(cwd);
    const pkg = loadPackage(cwd);
    const locked = {};
    (config.locked || []).forEach(name => {locked[name] = true;});
    const prefix = options.aggresive ? '>=' : '^';
    const dirty = transform([pkg.dependencies, pkg.devDependencies], (name, value) => {
      if (!locked[name] && /^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
  	  return prefix + value;
  	}
    });
    if(dirty) {
      savePackage(cwd, pkg);
    }
    resolve();
  });
}
