/**
 * Created by silver_android on 5/17/2017.
 */

const db = require('sqlite');

module.exports.getAll = async () => {
    try {
        const shows = await db.all('SELECT DISTINCT v.id, v.name, v.image_url, v.overview FROM videos v JOIN shows s ON s.video_id = v.id ORDER BY v.id;');
        return {error: false, shows};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getShow = async (name, year) => {
    try {
        let params = [name];
        if (year)
            params.push(year);

        const show = await db.get(`SELECT v.id, v.name, v.year, v.tmdb_id, v.image_url, v.overview FROM videos v WHERE v.name = ?${year ? ' AND v.year = ?' : ''} ORDER BY v.id;`, params);
        return {error: false, show};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getSeasons = async (showID) => {
    try {
        const seasons = await db.all('SELECT ss.season, ss.image_url, ss.overview FROM shows_seasons ss JOIN shows s ON ss.show_id = s.id JOIN videos v ON v.id = s.video_id WHERE v.id = ?;', showID);
        return {error: false, seasons};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getSeason = async (showID, seasonNumber) => {
    try {
        const season = await db.all('SELECT se.episode, se.image_url, se.overview FROM shows_episodes se JOIN shows s ON se.show_id = s.id JOIN videos v ON v.id = s.video_id WHERE v.id = ? AND se.season = ?;', [showID, seasonNumber]);
        return {error: false, season};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getEpisode = async (showID, seasonNumber, episodeNumber) => {
    try {
        const episode = await db.get('SELECT se.season, se.episode, v.path FROM shows_episodes se JOIN shows s ON se.show_id = s.id JOIN videos v ON v.id = s.video_id WHERE v.id = ? AND se.season = ? AND se.episode = ?;', [showID, seasonNumber, episodeNumber]);
        return {error: false, episode};
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
                console.log(`${name} S${season.season}E${episode.episode} already exists`);
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
    error = await showsEpisodesModel.add(name, season.season, episode.episode, episode.imageURL, episode.overview).error || error;
    return {error};
};
