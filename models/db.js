/**
 * Created by silver_android on 5/25/2017.
 */
const db = require('sqlite');
const Promise = require('bluebird');

const config = require('../config');

module.exports.init = async () => {
    try {
        await db.open(config[process.env.NODE_ENV], {Promise});
    } catch (e) {
        console.error(e.stack);
    }
};