#!usr/bin/env node
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const config = require('./config');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
const logSymbols = require('log-symbols');
const cliSpinners = require('cli-spinners');
const Spinner = require('cli-spinner').Spinner;

/**
 * 删除目录及下面的文件
 * @param {string} dirPath 目录的绝对路径
 */
function removeDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        let files = fs.readdirSync(dirPath);
        files.forEach(file => {
            let childPath = path.join(dirPath, file);
            if (fs.statSync(childPath).isDirectory()) {
                removeDir(childPath);
            } else {
                fs.unlinkSync(childPath);
            }
        });
    }
    fs.rmdirSync(dirPath);
}

/**
 * 下载包
 * @param {string} dirPath 目标目录路径，下载到目标目录下
 * @param {string} githubUrl 下载地址
 */
function getGitDemoPackages(dirPath, githubUrl) {
    const downloadUrl = githubUrl || config.reactCliTplUrlForGithub;
    if (fs.existsSync(dirPath) && fs.readdirSync(`${dirPath}`).length > 0) {
        return;
    } else if (fs.existsSync(dirPath)) {
        // shell.cd(dirPath);
    } else {
        fs.mkdirSync(dirPath);
        // shell.cd(dirPath);
    }
    if (shell.which('git')) {
        // shell.exec('git init');
        // console.log(logSymbols.info, chalk.cyan('loading start...'));
        // shell.exec(`git clone ${downloadUrl}`);
        // shell.cd('..');
        download('github:marsspecies/react-cli-template#master', dirPath, function(err) {
            console.log('222===', err);
        });
    } else {
        throw new Error('please install git ');
    }
}

/**
 * 加载动画
 * @param {Object} config 动画配置项{spinner}图标，{text}文字，{color}文字颜色
 * @return {Object}
 */
function loadingAnimate(config = {}) {
    const {
        text = 'Resolving packages...',
        color = 'cyan',
        spinner = 'dots'
    } = config;
    // var ami = new Spinner('%s' + chalk[color](text));
    // ami.setSpinnerString(cliSpinners[spinner].frames.join(''));
    console.log(cliSpinners[spinner].frames[0], text);
    return null;
}

module.exports =  {
    removeDir,
    getGitDemoPackages,
    loadingAnimate
}