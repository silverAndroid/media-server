/**
 * Created by silver_android on 5/23/2017.
 */
const db = require('sqlite');

module.exports.add = async (name, season, imageURL, overview) => {
    try {
        await db.run('INSERT INTO shows_seasons (show_id, season, image_url, overview) VALUES ((SELECT s.id FROM shows s JOIN videos v ON s.video_id = v.id JOIN video_names vn ON v.v_name_id = vn.id WHERE vn.name = ?), ?, ?, ?)', [name, season, imageURL, overview])
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
        return {error: true};
    }
};

module.exports.get = async (name, seasonNumber, year) => {
    try {
        let params = [name, seasonNumber];
        if (year)
            params.splice(1, 0, year);

        const season = await db.get(`SELECT vn.name, ss.season, ss.image_url AS imageURL, ss.overview FROM shows_seasons ss JOIN shows s ON ss.show_id = s.id JOIN videos v ON v.id = s.video_id JOIN video_names vn ON vn.id = v.v_name_id WHERE vn.name = ?${year ? ' AND vn.year = ?' : ''} AND ss.season = ?`, params);
        return {error: false, season};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};