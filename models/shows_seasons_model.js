/**
 * Created by silver_android on 5/23/2017.
 */
const db = require('sqlite');

module.exports.add = async (name, season, imageURL, overview) => {
    try {
        await db.run('INSERT INTO shows_seasons (show_id, season, image_url, overview) VALUES ((SELECT s.id FROM shows s JOIN videos v ON s.video_id = v.id WHERE v.name = ?), ?, ?, ?)', [name, season, imageURL, overview]);
        return { error: false };
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('shows_seasons.show_id, shows_seasons.season') > -1) {
                console.log(`${name} already exists`);
            } else {
                console.error(e);
            }
        } else {
            console.error(e);
        }
        return { error: true };
    }
};

module.exports.get = async (name, seasonNumber, year) => {
    try {
        const params = [name, seasonNumber];
        if (year) {
            params.splice(1, 0, year);
        }

        const season = await db.get(`SELECT v.name, ss.season, ss.image_url AS imageURL, ss.overview FROM shows_seasons ss JOIN shows s ON ss.show_id = s.id JOIN videos v ON v.id = s.video_id WHERE v.name = ?${year ? ' AND v.year = ?' : ''} AND ss.season = ?`, params);
        return { error: false, data: season };
    } catch (e) {
        console.error(e);
        return { error: true };
    }
};
