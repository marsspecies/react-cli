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
    return new Promise((resolve, reject) => {
        const downloadUrl = githubUrl || config.reactCliTplStoreNameForGithub;
        if (fs.existsSync(dirPath) && fs.readdirSync(`${dirPath}`).length > 0) {
            resolve();
            return;
        } else if (fs.existsSync(dirPath)) {
        } else {
            fs.mkdirSync(dirPath);
        }
        if (shell.which('git')) {
            download(downloadUrl, dirPath, function(err) {
                if (err) {
                    console.log(err, '------------')
                    reject(new Error(err))
                } else {
                    resolve();
                }
            });
        } else {
            reject(new Error('please install git '));
        }
    });
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