/**
 * Created by silver_android on 5/17/2017.
 */

const db = require('sqlite');

module.exports.getAll = async () => {
    try {
        const shows = await db.all('SELECT DISTINCT v.id, v.name, v.image_url, v.overview FROM videos v JOIN shows s ON s.video_id = v.id ORDER BY v.id;');
        return {error: false, data: shows};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getShow = async ({name, year, showID}) => {
    try {
        let where, params;
        if (name) {
            params = [name];
            if (year)
                params.push(year);
            where = `v.name = ?${year ? ' AND v.year = ?' : ''}`;
        } else if (showID) {
            where = `v.id = ?`;
            params = [showID];
        }

        const show = await db.get(`SELECT v.id, v.name, v.year, v.tmdb_id, v.image_url, v.overview FROM videos v WHERE ${where} ORDER BY v.id;`, params);
        return {error: false, data: show};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getSeasons = async (showID) => {
    try {
        const seasons = await db.all('SELECT ss.season, ss.image_url, ss.overview FROM shows_seasons ss JOIN shows s ON ss.show_id = s.id JOIN videos v ON v.id = s.video_id WHERE v.id = ?;', showID);
        return {error: false, data: seasons};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getSeason = async (showID, seasonNumber) => {
    try {
        const season = await db.get('SELECT ss.season, ss.image_url, ss.overview FROM shows_seasons ss JOIN shows s ON ss.show_id = s.id JOIN videos v ON v.id = s.video_id WHERE v.id = ? AND ss.season = ?;', [showID, seasonNumber]);
        return {error: false, data: season};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getEpisodes = async (showID, seasonNumber) => {
    try {
        const season = await db.all('SELECT se.episode, se.image_url, se.overview FROM shows_episodes se JOIN shows s ON se.show_id = s.id JOIN videos v ON v.id = s.video_id WHERE v.id = ? AND se.season = ?;', [showID, seasonNumber]);
        return {error: false, data: season};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getEpisode = async (showID, seasonNumber, episodeNumber) => {
    try {
        const episode = await db.get('SELECT se.name, se.image_url, se.overview, vl.path FROM shows_episodes se JOIN shows s ON se.show_id = s.id JOIN videos v ON v.id = s.video_id JOIN video_locations vl ON vl.video_id = v.id WHERE v.id = ? AND se.season = ? AND se.episode = ?;', [showID, seasonNumber, episodeNumber]);
        return {error: false, data: episode};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.add = async ({name, tmdbID, imageURL, overview, season, episode}, path, year) => {
    const videosModel = require('./videos_model');
    const videoLocationsModel = require('./video_locations_model');
    const showsSeasonsModel = require('./shows_seasons_model');
    const showsEpisodesModel = require('./shows_episodes_model');

    let error = false;

    error = await videosModel.add(name, tmdbID, imageURL, overview, year).error || error;
    error = await videoLocationsModel.add(name, path, year).error || error;

    try {
        await db.run('INSERT INTO shows (video_id) VALUES ((SELECT id FROM videos WHERE name = ?))', [name]);
    } catch (e) {
        if (e.message.indexOf('UNIQUE constraint failed') > -1) {
            if (e.message.indexOf('shows.video_id') > -1) {
                console.log(`${name} is already known as a show`);
            } else {
                console.error(e);
            }
        } else if (e.message.indexOf('NOT NULL constraint failed') > -1) {
            if (e.message.indexOf('shows.video_id') > -1) {
                console.log(`${path}`);
            }
        } else {
            console.error(e);
        }
    }
    error = await showsSeasonsModel.add(name, season.season, season.imageURL, season.overview).error || error;
    error = await showsEpisodesModel.add(name, season.season, episode.episode, episode.name, episode.imageURL, episode.overview).error || error;
    return {error};
};
