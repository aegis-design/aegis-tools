/**
  * Created by Zhengfeng Yao on 16/9/21.
  */
import { loadAegisConfig, loadPackage, savePackage } from './utils';

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

exports.freeze = async function freeze() {
  const cwd = process.cwd();
  const pkg = loadPackage(cwd);
  const dirty = transform([pkg.dependencies, pkg.devDependencies], (name, version) => {
    const mo = version.match(/^(?:[\^|\~])|(?:\>=?\s*)/);
    if (mo) {
      return version.slice(mo[0].length);
    }
  });
  if(dirty) {
    savePackage(pkg);
  }
  await dirty;
};

exports.unfreeze = async function unfreeze(options) {
  const config = loadAegisConfig();
  const pkg = loadPackage();
  const locked = {};
  (config.locked || []).forEach(name => {locked[name] = true;});
  const prefix = options.aggresive ? '>=' : '^';
  const dirty = transform([pkg.dependencies, pkg.devDependencies], (name, value) => {
    if (!locked[name] && /^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
      return prefix + value;
    }
  });
  if(dirty) {
    savePackage(pkg);
  }
  await dirty;
};
