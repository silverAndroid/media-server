/**
 * Created by silver_android on 5/15/2017.
 */

const db = require('sqlite');

module.exports.getAll = async () => {
    try {
        const movies = await db.all('SELECT m.id, vn.name, m.year FROM movies m JOIN videos v ON v.id = m.video_id JOIN video_names vn ON vn.id = v.v_name_id;');
        return {error: false, movies};
    } catch (e) {
        console.error(e);
        return {error: true}
    }
};

module.exports.get = async (id) => {
    try {
        const movie = await db.get('SELECT m.id, m.year, vn.name, v.path FROM movies m JOIN videos v ON v.id = m.video_id JOIN video_names vn ON vn.id = v.v_name_id WHERE m.id = ?', id);
        return {error: false, movie}
    } catch (e) {
        console.error(e);
        return {error: true}
    }
};