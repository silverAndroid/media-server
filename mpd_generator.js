const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const builder = require('xmlbuilder');

const fileUtil = require('./file_util');
const { logger } = require('./log');
const util = require('./util');
const videoProcessor = require('./video_processing');

module.exports.addChunk = (path, videoID, season, episode) => new Promise(async (resolve) => {
    const mpdFilePath = generateMPDFilePath(path);
    const fileExists = await mpdExists(mpdFilePath);

    await waitForEncoding(path);
    if (!fileExists) {
        create(path, videoID, season, episode);
    }
    resolve();
});

function mpdExists(path) {
    return fileUtil.existsFile(path);
}

function create(path, videoID, season, episode) {
    return new Promise(async (resolve) => {
        const duration = await getDuration(path);
        const mpdFilePath = generateMPDFilePath(path);
        const fileStream = fs.createWriteStream(mpdFilePath, { autoClose: true });
        const xmlWriter = builder.streamWriter(fileStream);
        xmlWriter.pretty = true;
        xmlWriter.newline = '\n';
        xmlWriter.indent = '    ';

        logger.verbose('Creating MPD for', mpdFilePath);

        const xml = builder.create({
            MPD: {
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@xmlns': 'urn:mpeg:dash:schema:mpd:2011',
                '@xsi:schemaLocation': 'urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd',
                '@type': 'static',
                '@mediaPresentationDuration': toXSDuration(duration),
                '@minBufferTime': 'PT2S',
                '@profiles': 'urn:mpeg:dash:profile:isoff-on-demand:2011',
                BaseURL: `http://localhost:8080/${videoID}/${season}/${episode}/video`,
            },
        });
        xml.end(xmlWriter);
        resolve();
    });
}

async function waitForEncoding(path) {
    const { key, index } = getPromiseFromMap(path);
    // TODO: See if there is a way to avoid this
    if (videoProcessor.promiseMap[key] !== undefined && videoProcessor.promiseMap[key][index] !== undefined) {
        await videoProcessor.promiseMap[key][index];
    }
}

function getPromiseFromMap(path) {
    const key = util.removeChunkEnding(path);
    const index = util.getChunkNumber(path);
    return { key, index };
}

function getDuration(path) {
    return new Promise((resolve, reject) => {
        ffmpeg(path)
            .ffprobe((err, metadata) => {
                if (err) reject(err);
                else if (metadata.format.duration) {
                    resolve(metadata.format.duration);
                } else if (metadata.streams.length > 0 && metadata.streams[0].duration) {
                    resolve(metadata.streams[0].duration);
                } else {
                    reject('Couldn\'t find duration');
                }
            });
    });
}

function toXSDuration(duration) {
    return `PT${duration}S`;
}

function generateMPDFilePath(path) {
    return `${util.removeFileExtension(util.removeChunkEnding(path))}.mpd`;
}
