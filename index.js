#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const commander = require('commander');
const inquirer = require('inquirer');
const shell = require('shelljs');
const chalk = require('chalk');
const outputProject = require('./.bin/outputProject');
const ora = require('ora');
                      
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'));
commander.version(packageJson.version, '-v --version');
commander.command('upgrade [version]').action(function (name) {
    shell.exec('npm install react-cli -g');
});


commander.command('init <name>').action(async name => {
    
    const initPrompt = (cb = answers => {return answers}) => {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                default: name,
                message: 'please enter your project name : ',
                validate: projectName => {
                    let reg = /[a-zA-Z0-9_-]+/g;                
                    return reg.test(projectName) || 'the project name that you create should be english, please enter a new name';
                    
                },
            },
            {
                type: 'list',
                name: 'config',
                message: 'Please pick a preset',
                choices: [
                    {
                        name: 'default（babel）',
                        value: 'default'
                    },
                    {
                        name: 'mobx（babel, tslint, mobx, typescript）',
                        value: 'mobx'
                    },
                    {
                        name: 'redux（babel, tslint, redux）',
                        value: 'redux'
                    },
                    {
                        name: 'Manually select features : ',
                        value: 'customConfig'
                    }
                ]
            },
            {
                type: 'checkbox',
                name: 'customChoices',
                message: 'Check the feature needed for your project : (Press <space> to select, <a> to toggle all, <i> to invert selection)',
                when: answers => {
                    return answers.config === 'customConfig';
                },                
                choices: [
                    {
                        name: 'eslint',
                        value: 'eslint'
                    },
                    {
                        name: 'Router',
                        value: 'router'
                    },
                    {
                        name: 'TypeScript',
                        value: 'typeScript'
                    },
                    {
                        name: 'tslint',
                        value: 'tslint'
                    },
                    {
                        name: 'Unit testing',
                        value: 'unitTest'
                    },
                    {
                        name: 'Mobx/Redux',
                        value: 'mobxRedux'
                    },
                ]
            },
            {
                type: 'list',
                name: 'storeManageTool',
                message: 'choose mobx or redux : ',
                when: answers => {
                    return answers.config === 'customConfig' && ~answers.customChoices.indexOf('mobxRedux');
                },
                choices: [
                    {
                        name: 'Mobx',
                        value: 'mobx'
                    },
                    {
                        name: 'redux',
                        value: 'redux'
                    },
                    {
                        name: 'neither',
                        value: 'neither'
                    }
                ]  
            }
        ]).then(cb);
    }
    const outPath = path.resolve(process.cwd(), name);
    const ifExistOutPath = fs.existsSync(outPath);
    if (ifExistOutPath) {
        let answer = await inquirer.prompt({
            type: 'list',
            name: 'outDirStratgy',
            message: `Target directory ${outPath} already exists \n pick an action:`,
            choices: [
                {
                    name: 'Overwrite',
                    value: 'overwrite'
                },
                {
                    name: 'Mergy',
                    value: 'mergy'
                },
                {
                    name: 'Cancel',
                    value: 'cancel'
                }
            ]
        });
        if (answer.outDirStratgy === 'cancel') {
            return false;
        } else if (answer.outDirStratgy === 'overwrite') {
            shell.rm('-R', outPath);
            fs.mkdirSync(outPath);
        }
        initPrompt(answers => {
            outputProject(answers);
        });
    } else {
        initPrompt(answers => {
            fs.mkdirSync(outPath);
            outputProject(answers);
        });
    }
    
});

if (!process.argv.slice(2).length) {
    commander.outputHelp(function(text){
        return chalk.cyan(text);
    });
}

// error on unknown commands
commander.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', commander.args.join(' '));
    process.exit(1);
});

commander.parse(process.argv);