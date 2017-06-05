/**
 * Created by silver_android on 5/17/2017.
 */

const showsModel = require('../models/shows_model');

module.exports.getAll = async (req, res) => {
    const shows = await showsModel.getAll();

    let statusCode = 200;
    if (shows.error)
        statusCode = 500;
    res.status(statusCode).json(shows);
};

module.exports.getSeasons = async (req, res) => {
    const seasons = await showsModel.getSeasons(req.params.id);

    let statusCode = 200;
    if (seasons.error)
        statusCode = 500;
    else if (seasons.seasons === undefined || seasons.seasons.length === 0)
        statusCode = 404;
    res.status(statusCode).json(seasons);
};

module.exports.getSeason = async (req, res) => {
    const season = await showsModel.getSeason(req.params.id, req.params.season);

    let statusCode = 200;
    if (season.error)
        statusCode = 500;
    else if (season.season === undefined || season.season.length === 0)
        statusCode = 404;
    res.status(statusCode).json(season);
};

module.exports.getEpisode = async (req, res) => {
    const episode = await showsModel.getEpisode(req.params.id, req.params.season, req.params.episode);
    if (episode.episode)
        delete episode.episode.path;

    let statusCode = 200;
    if (episode.error)
        statusCode = 500;
    else if (episode.episode === undefined)
        statusCode = 404;
    res.status(statusCode).json(episode);
};