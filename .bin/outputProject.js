const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const shell = require('shelljs');
const logSymbols = require('log-symbols');
const chalk = require('chalk');
const {getGitDemoPackages, loadingAnimate} = require('../utils/utils');
const getDeps = require('./getPackageDep');
const ora = require('ora');
const child_process = require('child_process');



module.exports = async answer => {
    const outDir = path.resolve(process.cwd(), answer.projectName);
    const {deps, config} = getDepsAndConfigFromAnswer(answer);
    // 将packages下的配置文件拷贝到生成的项目下
    await task(async function() {
        shell.cd(path.resolve(__dirname, '../packages'));
        shell.cp('-R', './', outDir);
        return true
    });
    // 将模版编译输出到项目下
    await task(async function() {
        const outputWebpackConfigTpl = fs.readFileSync(path.resolve(__dirname, '../tpls/webpackConfig.hbs')).toString();
        const outputWebpackDevConfigTpl = fs.readFileSync(path.resolve(__dirname, '../tpls/webpackDevConfig.hbs')).toString();
        const outputWebpackProdConfigTpl = fs.readFileSync(path.resolve(__dirname, '../tpls/webpackProdConfig.hbs')).toString();
        const outputPathsTpl = fs.readFileSync(path.resolve(__dirname, '../tpls/paths.hbs'));
        const outputBabelConfigTpl = fs.readFileSync(path.resolve(__dirname, '../tpls/babelconfig.hbs'));

        const outputWebpackConfig = handlebars.compile(outputWebpackConfigTpl)(config);
        fs.mkdirSync(`${outDir}/config`);
        fs.writeFileSync(`${outDir}/config/webpack.config.js`, outputWebpackConfig);
        fs.writeFileSync(`${outDir}/config/webpack.dev.config.js`, outputWebpackDevConfigTpl);
        fs.writeFileSync(`${outDir}/config/webpack.prod.config.js`, outputWebpackProdConfigTpl);
        fs.writeFileSync(`${outDir}/config/paths.js`, outputPathsTpl);
        fs.writeFileSync(`${outDir}/config/babel.config.js`, outputBabelConfigTpl);
        return true;
    }, {
        text: 'Generatings...',
        spinner: 'line'
    });
    
    // 从github上面下载模版并根据用户输入配置项进行编译
    await task(async function() {
        await getGitDemoPackages(path.resolve(__dirname, '../gitPackages'));
        fs.mkdirSync(`${outDir}/src`);
        shell.cd(path.resolve(__dirname, '../gitPackages'));
        shell.cp('-R', './', `${outDir}/src`);
        const appTpl = fs.readFileSync(path.resolve(`${outDir}/src/pages/app.hbs`)).toString();
        console.log(appTpl)
        const appJs = handlebars.compile(appTpl)(config);
        fs.writeFileSync(`${outDir}/src/pages/app.js`, appJs);
        shell.rm(`${outDir}/src/pages/app.hbs`);
        return true;
    }, {
        text: 'Fetching packages...',
        spinner: 'runner'
    });

    // 根据用户配置安装依赖
    await task(async function() {
        const name = answer.projectName;
        const outputPackageTpl = fs.readFileSync(path.resolve(__dirname, '../tpls/package.hbs')).toString();
        const outputPackage = handlebars.compile(outputPackageTpl)({
            name,
            deps
        });
        fs.writeFileSync(`${outDir}/package.json`, outputPackage);
        shell.cd(outDir);
        return new Promise(resolve => {
            installDeps(outDir, function() {
                resolve(true);
            });
        });
    }, {
        text: 'Installing dependencies...',
        spinner: 'runner'
    });
    // 完成项目输出
    console.log(logSymbols.success, chalk.green('compeleted'));
    process.exit(1);
}

/**
 * 创建异步任务
 * @param {Function} cb 
 */
async function task(cb = async () => {return true}, animate = {}) {
    const spinner = ora({
        text: chalk.cyan(animate.text || 'loading project...') + '\n',
        spinner: animate.spinner || 'dots'
    }).start();
    let status = await cb();
    // 这里的分隔符是为了防止spinner.stop()时将上一行输出删除，而默认删除分隔符这一次console
    console.log('=====================');
    if (status) {
        spinner.stop();
        console.log(logSymbols.success, chalk.green(`${animate.text || 'loading project...'} finished`));
    }
    return true;
}

/**
 * 安装依赖
 * @param {Object} deps 依赖对象，键值对，键名为依赖名，健值为版本号
 * @param {string} dirPath 安装目录,默认安装在创建项目的文件夹下
 */
function installDeps (dirPath, cb) {
    const installPath = dirPath || process.cwd();
    let child = child_process.fork(path.resolve(__dirname, './installDependencies.js'));
    child.send({cwd: installPath});
    child.on('message', function(msg) {
        if (msg.status === 'success') {
            cb && cb();
        }
    });
    
}

/**
 * 根据命令行交互结果获取当前项目所需依赖
 * @param {Object} answer 交互结果
 * @return {Object} 返回需要安装的依赖包，和webpack配置项
 */
function getDepsAndConfigFromAnswer (answer) {
    let deps = {};
    let config = {
        ifAddTs: false,
        ifAddEslint: false,
        ifAddTslint: false,
        ifAddRedux: false,
        ifAddUnitTest: false,
        ifAddMobx: false,
        ifAddRouter: false
    };
    switch (answer.config) {
        case 'mobx':
            config = Object.assign({}, config, {
                ifAddTs: true,
                ifAddTslint: true,
                ifAddMobx: true
            });
            deps = getDeps(config);
            break;
        case 'redux':
            config = Object.assign({}, config, {
                ifAddEslint: true,
                ifAddRedux: true
            });
            deps = getDeps(config);
            break;
        case 'customConfig': {
            config = Object.assign({}, config, {
                ifAddTs: ~answer.customChoices.indexOf('typeScript'),
                ifAddEslint: ~answer.customChoices.indexOf('eslint'),
                ifAddTslint: ~answer.customChoices.indexOf('tslint'),
                ifAddRouter: ~answer.customChoices.indexOf('router'),
                ifAddUnitTest: ~answer.customChoices.indexOf('unitTest')
            })
            if (~answer.customChoices.indexOf('mobxRedux')) {
                if (answer.storeManageTool === 'mobx') {
                    config.ifAddMobx = true;
                } else if (answer.storeManageTool === 'redux') {
                    config.ifAddRedux = true;
                }
            }
            deps = getDeps(config);
            break;
        }
        default:
            deps = getDeps();
            break;
    }
    return {deps, config};
}