/**
 * How to use ?
 * condition: you have installed svn commandline tools
 * 1. execute 'svn update' and login as prompted.
 * 2. execute 'npm run publish'.
 * Good Luck !
 */
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios');
const paths = require('../config/paths');
const config = require(paths.appPackageJson);

const run = util.promisify(async (command, callback) => {
    console.log('\x1B[32m', command);
    const { error, stdout } = await exec(command);
    error && console.log('\x1B[31m', error);
    return callback(console.log('\x1B[0m', stdout));
});

(async () => {
    // update fe code
    await run('svn update');
    // update back code
    await run('svn update ../back');
    // empty static dir
    if (fs.readdirSync('../back/static/').length) await run('svn delete ../back/static/* --force');
    // build
    await run('npm run build');
    // add to local cache
    await run(`svn add ../back/static/*`);
    // commit to svn
    await run(`svn ci -m "publish fe" ../back/static`);
    // restart back server
    axios
        .get(`${config.proxy}/pis/api/update`)
        .then(({ data }) => data.code === 200 && console.log('\x1B[32m', 'publish succeeded~'));
})();
