/**
 * Created by silver_android on 5/12/2017.
 */
const moviesModel = require('../models/movies_model');

module.exports.getAll = async (req, res) => {
    const movies = await moviesModel.getAll();

    let statusCode = 200;
    if (movies.error)
        statusCode = 500;
    res.status(statusCode).json(movies);
};

module.exports.get = async (req, res) => {
    const movie = await moviesModel.get(req.params.id);
    if (movie.data)
        delete movie.data.path;

    let statusCode = 200;
    if (movie.error)
        statusCode = 500;
    else if (!movie.data)
        statusCode = 404;
    res.status(statusCode).json(movie);
};