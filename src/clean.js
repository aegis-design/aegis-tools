/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import del from 'del';

module.exports = async function clean(dirs) {
  await del(dirs, { dot: true });
};
