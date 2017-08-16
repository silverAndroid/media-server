/**
 * Created by silver_android on 5/21/2017.
 */
const db = require('sqlite');

module.exports.add = async (name, path, season, episode, year) => {
    let error = false;
    try {
        const params = [name, path, season, episode];
        if (year) {
            params.splice(1, 0, year);
        }

        await db.run(`INSERT INTO video_locations (video_id, path, season, episode) VALUES ((SELECT id FROM videos WHERE name = ?${year === undefined ? '' : ' AND year = ?'}), ?, ?, ?)`, params);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('video_locations.path') > -1) {
                console.log('Video already exists');
            } else {
                error = true;
                console.error(e);
            }
        } else {
            error = true;
            console.error(e);
        }
    }
    return { error };
};
