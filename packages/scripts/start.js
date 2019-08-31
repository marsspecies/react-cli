const webpack = require('webpack');
const DevServer = require('webpack-dev-server');
const configFactory = require('../config/webpack.dev.config');
const opener = require('opener');
const net = require('net');

const env = {
    NODE_ENV: 'development'
};
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || '127.0.0.1';
// webpack 函数需要传入一个配置对象， 同时传入回调函数就会执行webpack compiler
const config = configFactory(env);
const compiler = webpack(config);
const app = new DevServer(compiler, {
    // 注意此处publicPath必填
    publicPath: config.output.publicPath,
    // HMR配置
    ...config.devServer,
    host: HOST
});

function startServer(port, cb = (err, port) => {}) {
    var server = net.createServer().listen(port, '127.0.0.1');
    server.on('listening', () => {
        // 端口未被占用
        server.close(() => {
            cb(null, port);
        });
    });
    server.on('error', err => {
        if (err.code === 'EADDRINUSE') {
            // 端口已经被占用
            startServer(port + 1, cb);
        } else {
            cb(err);
        }
    });
}
startServer(3000, (err, port) => {
    if (err) {
        console.log(`server error: ${err} `);
    } else {
        app.listen(port, HOST, err => {
            if (err) {
                console.log(err);
            } else {
                console.log(`start server : http://${HOST}:${port}`);
                opener(`http://${HOST}:${port}`);
            }
        });
    }
});
