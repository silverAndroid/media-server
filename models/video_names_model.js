/**
 * Created by silver_android on 5/21/2017.
 */
const db = require('sqlite');

module.exports.add = async (name, tmdbID, imageURL, overview, year) => {
    try {
        await db.run('INSERT INTO video_names (name, year, tmdb_id, image_url, overview) VALUES (?, ?, ?, ?, ?)', [name, year, tmdbID, imageURL, overview]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('video_names.name, video_names.year') > -1) {
                console.log(`${name} already exists`);
            } else if (e.message.indexOf('video_names.tmdb_id') > -1) {
                console.log(`${name} (${tmdbID}) already exists`);
            } else {
                console.error(e);
            }
        } else if (e.message.indexOf('NOT NULL constraint failed') > -1) {
            if (e.message.indexOf('video_names.image_url') > -1) {
                console.log(`${name} imageURL null (${imageURL})`);
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