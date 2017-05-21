/**
 * Created by silver_android on 5/15/2017.
 */

const db = require('sqlite');

module.exports.getAll = async () => {
    try {
        const movies = await db.all('SELECT m.id, vn.name, vn.year FROM movies m JOIN videos v ON v.id = m.video_id JOIN video_names vn ON vn.id = v.v_name_id;');
        return {error: false, movies};
    } catch (e) {
        console.error(e);
        return {error: true}
    }
};

module.exports.get = async (id) => {
    try {
        const movie = await db.get('SELECT m.id, vn.year, vn.name, v.path FROM movies m JOIN videos v ON v.id = m.video_id JOIN video_names vn ON vn.id = v.v_name_id WHERE m.id = ?', id);
        return {error: false, movie}
    } catch (e) {
        console.error(e);
        return {error: true}
    }
};

module.exports.add = async (name, path, year) => {
    const videoNamesModel = require('./video_names_model');
    const videosModel = require('./videos_model');

    await videoNamesModel.add(name, year);
    await videosModel.add(name, path, year);

    try {
        await db.run('INSERT INTO movies (video_id) VALUES ((SELECT id FROM videos WHERE path = ?))', [path]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('movies.video_id') > -1) {
                console.log(`${name} (${year}) already exists`);
            } else {
                console.error(e);
            }
        } else {
            console.error(e);
        }
        return {error: true};
    }

    return {error: false};
};