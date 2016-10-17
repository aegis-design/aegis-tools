/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import path from 'path';
import open from 'open';
import webpack from 'webpack';
import DevServer from 'webpack-dev-server';
import { getWebpackConfig } from './webpack.config';

const cwd = process.cwd();

function addHot(config) {
  if (Array.isArray(config.entry)) {
    config.entry.unshift(`webpack-dev-server/client?http://localhost:${config.port}`);
  } else if (config.entry.constructor == Object) {
    Object.keys(config.entry).forEach(key => {
      if (Array.isArray(config.entry[key])) {
        config.entry[key].unshift(`webpack-dev-server/client?http://localhost:${config.port}`, "webpack/hot/dev-server");
      } else {
        config.entry[key] = [`webpack-dev-server/client?http://localhost:${config.port}`, "webpack/hot/dev-server", config.entry[key]];
      }
    });
  } else {
    config.entry = [`webpack-dev-server/client?http://localhost:${config.port}`, "webpack/hot/dev-server", config.entry];
  }

  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new webpack.NoErrorsPlugin());
  config
    .module
    .loaders
    .filter(x => x.loader.indexOf('babel') !== -1)
    .forEach(x => (x.query = {
      plugins: [
        ...config.babel.plugins,
        [
          require.resolve('babel-plugin-react-transform'), {
          transforms: [
            {
              transform: 'react-transform-hmr',
              imports: ['react'],
              locals: ['module'],
            }, {
              transform: 'react-transform-catch-errors',
              imports: ['react', 'redbox-react'],
            },
          ],
        },
        ],
      ],
    }));
}

function getPublicPath(config) {
  const base = path.resolve(cwd, config.output.path);
  const parent = path.resolve(base, '..');
  const sub = parent == cwd ? '/' : base.substring(parent.length);
  return `http://localhost:${config.port}${sub}`;
}

export default class WebpackDevServer {
  constructor(options) {
    this.config = getWebpackConfig(options)[0];
    this.config.port = this.config.port || 9090;
    this.config.output.publicPath = getPublicPath(this.config);
    const base = path.join(cwd, this.config.output.path);
    this.config.devServer = Object.assign({
      contentBase: base,
      historyApiFallback: true,
      hot: true,
    }, this.config.devServer);
    this.config.output.path = base;
    addHot(this.config);
  }

  run() {
    new DevServer(webpack(this.config), this.config.devServer)
      .listen(this.config.port, 'localhost', (err) => {
        if (err) {
          console.log(err);
        }
        console.log(`The server is running at http://localhost:${this.config.port}/webpack-dev-server/`);
        open(`http://localhost:${this.config.port}/webpack-dev-server/`);
      });
  }
}
