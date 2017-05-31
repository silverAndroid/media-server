/**
 * Created by silver_android on 5/25/2017.
 */
const db = require('sqlite');
const Promise = require('bluebird');

const config = require('../config');
const fileListen = require('../file_listen');

module.exports.init = async () => {
    try {
        await db.open(config[process.env.NODE_ENV], {Promise});
        await fileListen.init();
    } catch (e) {
        console.error(e.stack);
    }
};