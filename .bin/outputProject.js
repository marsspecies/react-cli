const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const shell = require('shelljs');
const logSymbols = require('log-symbols');
const chalk = require('chalk');
const {getGitDemoPackages, loadingAnimate} = require('../utils/utils');
const getDeps = require('./getPackageDep');

module.exports = async answer => {
    const outDir = path.resolve(process.cwd(), answer.projectName);
    const {deps, config} = getDepsAndConfigFromAnswer(answer);
    let taskLoadDefaultFiles = task(function() {
        loadingAnimate();
        shell.cd(path.resolve(__dirname, '../packages'));
        shell.cp('-R', './', outDir);
    });

    let taskLoadConfigWebpack = task(function() {
        loadingAnimate({
            text: 'Generatings...',
            spinner: 'line'
        });
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
    });
    
    let taskLoadGitDemoPackages = task(function() {
        loadingAnimate({
            text: 'Fetching packages...',
            spinner: 'runner'
        });
        getGitDemoPackages(path.resolve(__dirname, '../gitPackages'));
        fs.mkdirSync(`${outDir}/src`);
        shell.cd(path.resolve(__dirname, '../gitPackages'));
        shell.cp('-R', './', `${outDir}/src`);
        const appTpl = fs.readFileSync(path.resolve(`${outDir}/src/pages/app.hbs`)).toString();
        const appJs = handlebars.compile(appTpl)(config);
        fs.writeFileSync(`${outDir}/src/pages/app.js`, appJs);
        shell.rm(`${outDir}/src/pages/app.hbs`);
    });

    let taskLoadPackageJsonDeps = task(function() {
        loadingAnimate({
            text: 'Installing dependencies...',
            spinner: 'runner'
        });
        const name = answer.projectName;
        const outputPackageTpl = fs.readFileSync(path.resolve(__dirname, '../tpls/package.hbs')).toString();
        const outputPackage = handlebars.compile(outputPackageTpl)({
            name,
            deps
        });
        fs.writeFileSync(`${outDir}/package.json`, outputPackage);
        shell.cd(outDir);
        installDeps(outDir);
    });
    
    Promise.all([taskLoadGitDemoPackages, taskLoadConfigWebpack, taskLoadDefaultFiles, taskLoadPackageJsonDeps]).then(function() {
        console.log(logSymbols.success, chalk.green('compeleted'));
    });
}

/**
 * 创建异步任务
 * @param {Function} cb 
 */
async function task(cb = () => {}) {
    cb();
}

/**
 * 安装依赖
 * @param {Object} deps 依赖对象，键值对，键名为依赖名，健值为版本号
 * @param {string} dirPath 安装目录,默认安装在创建项目的文件夹下
 */
function installDeps (deps, dirPath) {
    const installPath = dirPath || process.cwd();
    // let strDeps = Object.keys(deps).map(depName => {
    //     return `${depName}@${deps[depName]}`;
    // });
    shell.cd(installPath);
    shell.exec('npm install');
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
        ifAddRouter: false,
        ifAddRedux: false,
        ifAddUnitTest: false,
        ifAddMobx: false
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