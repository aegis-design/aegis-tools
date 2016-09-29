/**
 * Created by Zhengfeng.Yao on 16/9/22.
 */
import path from 'path';
import open from 'open';
import webpack from 'webpack';
import DevServer from 'webpack-dev-server';
import { getWebpackConfig } from './webpack.config';

export default class WebpackDevServer {
  constructor(options) {
    this.config = getWebpackConfig(options)[0];
    this.config.port = this.config.port || 8080;
    this.config.output.publicPath = this.config.output.publicPath || this.config.output.path;
    this.config.devServer = this.config.devServer || {
        contentBase: path.join(process.cwd(), this.config.output.path),
        historyApiFallback: true,
        hot: true,
        port: this.config.port,
        publicPath: this.config.output.path,
        noInfo: false
      };
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
