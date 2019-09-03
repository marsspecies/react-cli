const {execSync} = require('child_process');

process.on('message', function(msg) {
    if (msg.cwd) {
        execSync(`cd ${msg.cwd}`);
        execSync(`npm install`);
        process.send({status: 'success'});
    }
});