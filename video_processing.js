/**
 * Created by silver_android on 6/12/2017.
 */
const fs = require('fs');
const promiseLimit = require('promise-limit');
const ffmpeg = require('fluent-ffmpeg');

const limit = promiseLimit(Number(process.env.MAX_FFMPEG_PROCESSES));

const util = require('./util');

const chunkSize = Number(process.env.CHUNK_SIZE);

module.exports.process = async (path) => {
    const files = await limit(() => splitFiles(path));
    await module.exports.convert(files);
};

module.exports.checkIfVideoEncoded = path => new Promise(async (resolve, reject) => {
    let counter = 0;
    const parentFolder = util.getParentFolder(path);
    const fileNameNoExt = util.removeFileExtension(util.getFileName(path));
    const unencodedFiles = [];

    fs.readFile(`${util.removeFileExtension(path)}.txt`, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                resolve({ encoded: false, files: [] });
            } else {
                reject(err);
            }
        } else {
            const numFiles = data.split('\n').length;
            fs.readdir(parentFolder, async (error, files) => {
                if (!error) {
                    let encoded = false;
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (util.isChunkedVideo(file)) {
                            const fileNoExt = util.removeFileExtension(util.getFileName(file));
                            if (fileNoExt.indexOf(fileNameNoExt) > -1) {
                                const fileExtension = util.getFileExtension(file);
                                if (fileExtension === 'mp4') {
                                    counter += 1;
                                    if (counter === numFiles) {
                                        encoded = true;
                                        break;
                                    }
                                } else {
                                    unencodedFiles.push(`${parentFolder}\\${file}`);
                                }
                            }
                        }
                    }
                    resolve({ encoded, files: unencodedFiles });
                } else reject(error);
            });
        }
    });
});

module.exports.convert = paths => new Promise((resolve, reject) => {
    const tasks = paths.map(path => limit(() => encode(path)));
    Promise.all(tasks).then(resolve).catch(reject);
});

function splitFiles(path) {
    return new Promise((resolve, reject) => {
        const pathNoExt = util.removeFileExtension(path);
        const extension = util.getFileExtension(path);
        const fileName = `${pathNoExt}_%04d.${extension}`;
        const files = [];
        const fileSearchRegex = /Opening '(.+)' for writing/g;
        let message = '';

        ffmpeg(path)
            .outputOptions([
                '-c copy',
                '-map 0',
                `-segment_time ${chunkSize}`,
            ])
            .output(fileName)
            .format('segment')
            .on('start', command => console.log(`Spawning ${command}`))
            .on('stderr', (data) => {
                message += data;
                let file;
                let index;
                // eslint-disable-next-line no-cond-assign
                while (file = fileSearchRegex.exec(message)) {
                    files.push(file[1]);
                    index = file.index;
                }
                message = message.slice(index).replace(fileSearchRegex, '');
                console.error(data);
            })
            .on('error', err => reject(err.message))
            .on('end', () => {
                console.log(`Successfully chunked ${path}`);
                fs.writeFile(`${pathNoExt}.txt`, files.map(file => `${util.removeFileExtension(file)}.mp4`).join('\n'), (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(files);
                });
            })
            .run();
    });
}

function encode(path) {
    return new Promise((resolve, reject) => {
        const pathNoExt = util.removeFileExtension(path);
        const fileName = util.getFileName(path);
        let message = '';

        ffmpeg(path)
            .outputOptions([
                '-preset fast',
                '-speed 8',
                '-profile:v main',
                '-hide_banner',
            ])
            .audioCodec('aac')
            .videoCodec('libx264')
            .format('mp4')
            .on('start', (command) => {
                console.log(`Encoding ${path} to ${pathNoExt}.mp4`);
                console.log(`Spawning ${command}`);
            })
            .on('error', err => reject(err))
            .on('stderr', (data) => {
                message += data;
                if (message.indexOf('Overwrite ?') > -1) {
                    // child.stdin.write('y\n');
                    // child.stdin.end();
                    message = '';
                }
            })
            .on('end', () => {
                resolve();
                console.log(`Successfully encoded ${fileName}`);
                fs.unlink(path, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            })
            .save(`${pathNoExt}.mp4`);
    });
}
