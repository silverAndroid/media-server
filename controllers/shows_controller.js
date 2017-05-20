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

module.exports.get = async (req, res) => {
    try {
        const show = await showsModel.get(req.params.id);
        if (show.show)
            delete show.show.path;

        let statusCode = 200;
        if (show.error)
            statusCode = 500;
        else if (show.show === undefined)
            statusCode = 404;
        res.status(statusCode).json(show);
    } catch (e) {
        console.error(e);
    }
};
