/**
 * Created by silver_android on 5/18/2017.
 */
const app = require('express').Router();

const controller = require('../controllers/shows_controller');
const videosController = require('../controllers/videos_controller');

app.get('/', controller.getAll);
app.get('/:id', controller.getSeasons);
app.get('/:id/:season', controller.getEpisodes);
app.get('/:id/:season/:episode', controller.getEpisode);
app.get('/:id/:season/:episode/video', videosController.getEpisode);
app.get('/:id/:season/:episode/video/:part', videosController.getEpisodeChunk);

module.exports = app;
