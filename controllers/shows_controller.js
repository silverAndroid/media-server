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

module.exports.getSeasons = async (req, res) => {
    const [show, seasons] = await Promise.all([
        showsModel.getShow({showID: req.params.id}),
        showsModel.getSeasons(req.params.id),
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
    res.status(statusCode).json({error, show, seasons});
};

module.exports.getEpisodes = async (req, res) => {
    const [season, episodes] = await Promise.all([
        showsModel.getSeason(req.params.id, req.params.season),
        showsModel.getEpisodes(req.params.id, req.params.season),
    ]);

    let statusCode = 200;
    const error = season.error || episodes.error;
    delete season.error;
    delete episodes.error;

    if (error) {
        statusCode = 500;
    } else if (!season.data || !episodes.data || episodes.data.length === 0) {
        statusCode = 404;
    }
    res.status(statusCode).json({error, season, episodes});
};

module.exports.getEpisode = async (req, res) => {
    const episode = await showsModel.getEpisode(
        req.params.id,
        req.params.season,
        req.params.episode,
    );
    if (episode.data) {
        delete episode.data.path;
    }

    let statusCode = 200;
    if (episode.error) {
        statusCode = 500;
    } else if (!episode.data) {
        statusCode = 404;
    }
    res.status(statusCode).json(episode);
};
