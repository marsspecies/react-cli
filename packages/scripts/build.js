const webpack = require('webpack');
const configFactory = require('../config/webpack.prod.config');

const env = {
  NODE_ENV: 'production'
};
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const config = configFactory(env);
const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
      console.log(err);
      return;
  }

  console.log(stats.toString({
    hash: false,
    children: false,
    modules: false,
    chunkOrigins: false,
    chunksSort: false,
    source: false,
    // 以下是控制台参数
    chunks: false,
    colors: true
  }));

  console.log('Compiled is completed');
})
