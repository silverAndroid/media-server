/**
 * Created by silver_android on 5/24/2017.
 */
const db = require('sqlite');

module.exports.add = async (name, season, episode, imageURL, overview) => {
    try {
        await db.run('INSERT INTO shows_episodes (show_id, season, episode, image_url, overview) VALUES ((SELECT s.id FROM shows s JOIN videos v ON s.video_id = v.id WHERE v.name = ?), ?, ?, ?, ?)', [name, season, episode, imageURL, overview]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('shows_episodes.show_id, shows_episodes.season, shows_episodes.episode') > -1) {
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

module.exports.get = async (name, seasonNumber, episodeNumber, year) => {
    try {
        let params = [name, seasonNumber, episodeNumber];
        if (year)
            params.splice(1, 0, year);

        const episode = await db.get(`SELECT v.name, se.season, se.episode, se.image_url AS imageURL, se.overview FROM shows_episodes se JOIN shows s ON s.id = se.show_id JOIN videos v ON v.id = s.video_id WHERE v.name = ?${year ? ' AND v.year = ?' : ''} AND se.season = ? AND se.episode = ?`, params);
        return {error: false, episode};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};