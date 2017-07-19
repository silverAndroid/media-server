/**
 * Created by silver_android on 5/21/2017.
 */
require('dotenv').config();

module.exports = {
    development: process.env.DB_PATH,
    test: process.env.TEST_DB_PATH,
};
