/**
 * Created by silver_android on 5/17/2017.
 */

const fs = require('fs');

const moviesModel = require('../models/movies_model');
const showsModel = require('../models/shows_model');

module.exports.getMovie = async ({ params: { id }, headers: { range } }, res) => {
    const movie = await moviesModel.get(id);
    const path = movie.data.path;

    getVideo(range, res, path);
};

module.exports.getEpisode = async ({ params: { id, season, episode }, headers: { range } }, res) => {
    const episodeObj = await showsModel.getEpisode(id, season, episode);
    const path = episodeObj.data.path;

    getVideo(range, res, path);
};

module.exports.getEpisodeChunk = async ({ params: { id, season, episode, part }, headers: { range } }, res) => {
    const episodeObj = await showsModel.getEpisode(id, season, episode, part);
    const path = episodeObj.data.path;

    getVideo(range, res, path);
};

const getVideo = (range, res, path) => {
    try {
        const total = fs.statSync(path).size;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const partialStart = parts[0];
            const partialEnd = parts[1];

            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
            const chunkSize = (end - start) + 1;
            console.log(`RANGE: ${start} - ${end} = ${chunkSize}`);

            const file = fs.createReadStream(path, { start, end });
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${total}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            });
            file.pipe(res);
        } else {
            console.log(`ALL: ${total}`);
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
            fs.createReadStream(path).pipe(res);
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: true });
    }
};
