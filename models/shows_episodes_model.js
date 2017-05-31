/**
 * Created by silver_android on 5/24/2017.
 */
const db = require('sqlite');

module.exports.add = async (name, season, episode, imageURL, overview) => {
    try {
        await db.run('INSERT INTO shows_episodes (show_id, season, episode, image_url, overview) VALUES ((SELECT s.id FROM shows s JOIN videos v ON s.video_id = v.id JOIN video_names vn ON v.v_name_id = vn.id WHERE vn.name = ?), ?, ?, ?, ?)', [name, season, episode, imageURL, overview]);
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