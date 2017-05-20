/**
 * Created by silver_android on 5/18/2017.
 */
const app = require('express').Router();
const controller = require('../controllers/shows_controller');
const videosController = require('../controllers/videos_controller');

app.get('/', controller.getAll);
app.get('/:id', controller.getSeasons);
app.get('/:id/video', videosController.getShow);

module.exports = app;
