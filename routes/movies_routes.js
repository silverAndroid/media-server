/**
 * Created by silver_android on 5/12/2017.
 */
const app = require('express').Router();

const controller = require('../controllers/movies_controller');
const videoController = require('../controllers/videos_controller');

app.get('/', controller.getAll);
app.get('/:id', controller.get);
app.get('/:id/video', videoController.getMovie);

module.exports = app;