/**
 * Created by silver_android on 5/21/2017.
 */
const db = require('sqlite');

module.exports.add = async (name, year) => {
    try {
        await db.run('INSERT INTO video_names (name, year) VALUES (?, ?)', [name, year]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('video_names.name') > -1) {
                console.log(`${name} already exists`);
            } else {
                console.error(e);
                return {error: true}
            }
        } else {
            console.error(e);
            return {error: true};
        }
    }
};