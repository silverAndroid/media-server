/**
 * Created by silver_android on 5/15/2017.
 */
const app = require('express').Router();
const movieRoutes = require('./movies_routes');
const showRoutes = require('./shows_routes');

app.use('/movies', movieRoutes);
app.use('/shows', showRoutes);

module.exports = app;
