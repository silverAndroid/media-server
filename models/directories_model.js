/**
 * Created by silver_android on 5/17/2017.
 */

const db = require('sqlite');

module.exports.getDirectories = async () => {
    let directories;
    try {
        directories = await db.all('SELECT path FROM directories;');
    } catch (e) {
        console.error(e);
        return {error: true};
    }
    return directories.map(directory => directory.path);
};

module.exports.add = async (directory) => {
    try {
        await db.run('INSERT INTO directories (path) VALUES (?);', [directory]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('directories.path') > -1) {
                console.log(`${directory} already added`);
            } else {
                console.error(e);
                return {error: true};
            }
        } else {
            console.error(e);
            return {error: true};
        }
    }
    return {error: false};
};
