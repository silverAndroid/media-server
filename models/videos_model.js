/**
 * Created by silver_android on 5/21/2017.
 */
const db = require('sqlite');

const { logger } = require('../log');

module.exports.add = async (name, tmdbID, imageURL, overview, year) => {
    let error = false;
    try {
        await db.run('INSERT INTO videos (name, year, tmdb_id, image_url, overview) VALUES (?, ?, ?, ?, ?)', [name, year, tmdbID, imageURL, overview]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('videos.name, videos.year') > -1) {
                logger.verbose(`${name} already exists`);
            } else if (e.message.indexOf('videos.tmdb_id') > -1) {
                logger.verbose(`${name} (${tmdbID}) already exists`);
            } else {
                error = true;
                logger.error(e);
            }
        } else if (e.message.indexOf('NOT NULL constraint failed') > -1) {
            if (e.message.indexOf('videos.image_url') > -1) {
                error = true;
                logger.log(`${name} imageURL null (${imageURL})`);
            } else {
                error = true;
                logger.error(e);
            }
        } else {
            error = true;
            logger.error(e);
        }
    }
    const { id } = await db.get('SELECT id FROM videos WHERE tmdb_id = ?;', [tmdbID]);
    return { error, videoID: id };
};
