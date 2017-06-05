/**
 * Created by silver_android on 5/15/2017.
 */

const db = require('sqlite');

module.exports.getAll = async () => {
    try {
        const movies = await db.all('SELECT m.id, v.name, v.year FROM movies m JOIN videos v ON v.id = m.video_id;');
        return {error: false, data: movies};
    } catch (e) {
        console.error(e);
        return {error: true}
    }
};

module.exports.get = async (id) => {
    try {
        const movie = await db.get('SELECT m.id, v.year, v.name, vl.path FROM movies m JOIN videos v ON v.id = m.video_id JOIN video_locations vl ON vl.video_id = v.id WHERE m.id = ?', id);
        return {error: false, data: movie}
    } catch (e) {
        console.error(e);
        return {error: true}
    }
};

module.exports.add = async (name, path, tmdbID, imageURL, overview, year) => {
    const videosModel = require('./videos_model');
    const videoLocationsModel = require('./video_locations_model');

    await videosModel.add(name, tmdbID, imageURL, overview, year);
    await videoLocationsModel.add(name, path, year);

    try {
        await db.run('INSERT INTO movies (video_id) VALUES ((SELECT id FROM video_locations WHERE path = ?))', [path]);
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