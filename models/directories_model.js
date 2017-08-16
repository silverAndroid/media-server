/**
 * Created by silver_android on 5/17/2017.
 */

const db = require('sqlite');

const { logger } = require('../log');

module.exports.getDirectories = async () => {
    let directories;
    try {
        directories = await db.all('SELECT path FROM directories;');
    } catch (e) {
        logger.error(e);
        return { error: true };
    }
    return directories.map(directory => directory.path);
};

module.exports.add = async (directory) => {
    try {
        await db.run('INSERT INTO directories (path) VALUES (?);', [directory]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('directories.path') > -1) {
                logger.verbose(`${directory} already added`);
            } else {
                logger.error(e);
                return { error: true };
            }
        } else {
            logger.error(e);
            return { error: true };
        }
    }
    return { error: false };
};
