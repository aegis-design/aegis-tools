/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import fs from 'fs';
import path from 'path';
import gaze from 'gaze';
import chalk from 'chalk';
import Promise from 'bluebird';
import { makeDir } from './utils';

async function copyFiles(source, target , watch) {
  const ncp = Promise.promisify(require('ncp'));
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    await makeDir(dir);
  }

  await ncp(source, target);

  if (watch) {
    const watcher = await new Promise((resolve, reject) => {
      gaze(path.join(source, '**/*.*'), (err, val) => err ? reject(err) : resolve(val));
    });
    watcher.on('changed', async (file) => {
      const relPath = file.substr(path.join(process.cwd(), source).length);
      console.log(`${relPath} changed`);
      await ncp(`${paht.join(source, relPath)}`, `${path.join(target, relPath)}`);
    });
  }
}

module.exports = async function copy(task, watch) {
  if (task.constructor.name == 'Array') {
    for (let i = 0; i < task.length; i++) {
      const { source, target } = task[i];
      if (source && target) {
        await copyFiles(source, target, watch);
      }
    }
  } else if (task.constructor.name == 'Object') {
    const { source, target } = task;
    if (source && target) {
      await copyFiles(source, target, watch);
    } else {
      await console.log(chalk.bold.red('No copy task. Source and target should not be null.'));
    }
  } else {
    await console.log(chalk.bold.red('No copy task.'));
  }
};
