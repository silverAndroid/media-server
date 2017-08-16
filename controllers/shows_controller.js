/**
 * Created by silver_android on 5/17/2017.
 */

const showsModel = require('../models/shows_model');

module.exports.getAll = async (req, res) => {
    const shows = await showsModel.getAll();

    let statusCode = 200;
    if (shows.error) {
        statusCode = 500;
    }
    res.status(statusCode).json(shows);
};

module.exports.getSeasons = async ({ params: { id } }, res) => {
    const [show, seasons] = await Promise.all([
        showsModel.getShow({ showID: id }),
        showsModel.getSeasons(id),
    ]);

    let statusCode = 200;
    const error = show.error || seasons.error;
    delete show.error;
    delete seasons.error;
    if (show.data) {
        delete show.data.id;
        delete show.data.tmdb_id;
    }

    if (error) {
        statusCode = 500;
    } else if (!show.data || !seasons.data || seasons.data.length === 0) {
        statusCode = 404;
    }
    res.status(statusCode).json({ error, show, seasons });
};

module.exports.getEpisodes = async ({ params: { id, season } }, res) => {
    const [seasonData, episodes] = await Promise.all([
        showsModel.getSeason(id, season),
        showsModel.getEpisodes(id, season),
    ]);

    let statusCode = 200;
    const error = seasonData.error || episodes.error;
    delete seasonData.error;
    delete episodes.error;

    if (error) {
        statusCode = 500;
    } else if (!seasonData.data || !episodes.data || episodes.data.length === 0) {
        statusCode = 404;
    }
    res.status(statusCode).json({ error, season: seasonData, episodes });
};

module.exports.getEpisode = async ({ params: { id, season, episode } }, res) => {
    const episodeData = await showsModel.getEpisode(
        id,
        season,
        episode,
    );
    if (episodeData.data) {
        delete episodeData.data.path;
    }

    let statusCode = 200;
    if (episodeData.error) {
        statusCode = 500;
    } else if (!episodeData.data) {
        statusCode = 404;
    }
    res.status(statusCode).json(episodeData);
};
