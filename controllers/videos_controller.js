/**
 * Created by silver_android on 5/17/2017.
 */

const moviesModel = require('../models/movies_model');
const showsModel = require('../models/shows_model');
const fs = require('fs');

module.exports.getMovie = async (req, res) => {
    const movie = await moviesModel.get(req.params.id);
    const path = movie.movie.path;

    module.exports.getVideo(req, res, path);
};

module.exports.getShow = async (req, res) => {
    const episode = await showsModel.getEpisode(req.params.id, req.params.season, req.params.episode);
    const path = episode.episode.path;

    module.exports.getVideo(req, res, path);
};

module.exports.getVideo = (req, res, path) => {
    try {
        const total = fs.statSync(path).size;
        if (req.headers.range) {
            const range = req.headers.range;
            const parts = range.replace(/bytes=/, "").split("-");
            const partialStart = parts[0];
            const partialEnd = parts[1];

            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
            const chunkSize = (end - start) + 1;
            console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunkSize);

            const file = fs.createReadStream(path, {start: start, end: end});
            res.writeHead(206, {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            });
            file.pipe(res);
        } else {
            console.log('ALL: ' + total);
            res.writeHead(200, {'Content-Length': total, 'Content-Type': 'video/mp4'});
            fs.createReadStream(path).pipe(res);
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({error: true});
    }
};