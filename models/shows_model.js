/**
 * Created by silver_android on 5/17/2017.
 */

const db = require('sqlite');

module.exports.getAll = async () => {
    try {
        const shows = await db.all('SELECT DISTINCT vn.id, vn.name FROM video_names vn JOIN videos v ON vn.id = v.v_name_id JOIN shows s ON v.id = s.video_id ORDER BY vn.id;');
        return {error: false, shows};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getSeasons = async (showID) => {
    try {
        const seasons = await db.all('SELECT DISTINCT s.season FROM shows s JOIN videos v ON v.id = s.video_id JOIN video_names vn ON vn.id = v.v_name_id WHERE vn.id = ?;', showID).map(season => season.season);
        return {error: false, seasons};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getSeason = async (showID, seasonNumber) => {
    try {
        const season = await db.all('SELECT s.episode FROM shows s JOIN videos v ON v.id = s.video_id JOIN video_names vn ON vn.id = v.v_name_id WHERE vn.id = ? AND s.season = ?;', [showID, seasonNumber]);
        return {error: false, season};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getEpisode = async (showID, seasonNumber, episodeNumber) => {
    try {
        const episode = await db.get('SELECT s.season, s.episode, v.path FROM shows s JOIN videos v ON v.id = s.video_id JOIN video_names vn ON vn.id = v.v_name_id WHERE vn.id = ? AND s.season = ? AND s.episode = ?;', [showID, seasonNumber, episodeNumber]);
        return {error: false, episode};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.add = async (name, path, season, episode, year) => {
    try {
        await db.run('INSERT INTO video_names (name, year) VALUES (?, ?)', [name, year]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('video_names.name') > -1) {
                console.log(`${name} already exists`);
            } else {
                console.error(e);
                return {error: true}
            }
        } else {
            console.error(e);
            return {error: true};
        }
    }

    try {
        let params = [name, path];
        if (year !== undefined)
            params.splice(1, 0, year);

        await db.run(`INSERT INTO videos (v_name_id, path) VALUES ((SELECT id FROM video_names WHERE name = ?${year === undefined ? '' : ' AND year = ?'}), ?)`, params);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('videos.path') > -1) {
                console.log(`Video already exists`);
            } else {
                console.error(e);
                return {error: true}
            }
        } else {
            console.error(e);
            return {error: true};
        }
    }

    try {
        await db.run('INSERT INTO shows (season, episode, video_id) VALUES (?, ?, (SELECT id FROM videos WHERE path = ?))', [season, episode, path]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('shows.season, shows.episode') > -1) {
                console.log(`${name} S${season}E${episode} already exists`);
            } else {
                console.error(e);
            }
        } else {
            console.error(e);
        }
        return {error: true}
    }
    return {error: false};
};
