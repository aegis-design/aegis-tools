# aegis-tools

![Amount of Downloads per month](https://img.shields.io/npm/dm/aegis-tools.svg "Amount of Downloads") 
![Node Version](https://img.shields.io/node/v/aegis-tools.svg "Node Version")

> 基于webpack的react项目编译工具,支持babel+es6和typescript,支持less/sass/scss/stylus等样式,内置webpack dev server,支持热加载。内置测试框架karma+mocha+chai+PhantomJS

## 安装
```bash
# 安装在全局,并link到项目中
npm install -g aegis-tools
npm link aegis-tools
# 直接安装到项目中
npm install aegis-tools --save-dev
```
## 配置说明

在项目中创建aegis.config
开发版本: aegis.config.dev.js
上线版本: aegis.config.js
单元测试: aegis.config.test.js

开发与线上版本配置说明
```bash
{
  web: {
    // 同webpack配置,已内置babel、ts及必要loaders/plugins
    // 此处仅需要配置entry/output等必要自定义配置
    // 若需要使用其他配置,同webpack配置可与默认配置合并,例如CommonChunkPlugin/HtmlWebpackPlugin等
  },
  node: {
    同web配置,内置target: node,为node服务端配置
  },
  autoprefixer: [
    //autoprefixer的配置,以下为默认配置
    'last 2 versions',
    '> 1%',
    'Explorer >= 9',
  ],
  copy: {                       // 复制功能, watch模式时会监听变化
    source: xxx,
    target: xxx
  }
}
```
单元测试配置说明
```bash
{
  testPath: './test',           // 测试代码所在路径,必填
  src: './src',                 // 源码所在路径,必填
  output: './coverage/',        // 测试报告输出路径,必填
  files: ['test/loadTest.js']   // 包含测试代码,必填
  ts: {                         // typescript项目必填,同tsconfig.json配置
    configFileName: "tsconfig.test.json",
  }
}
```
