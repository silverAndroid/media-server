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
