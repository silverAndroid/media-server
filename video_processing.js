/**
 * Created by silver_android on 6/12/2017.
 */
const childProcess = require('child_process');
const fs = require('fs');
const promiseLimit = require('promise-limit');

const limit = promiseLimit(Number(process.env.MAX_FFMPEG_PROCESSES));

const util = require('./util');

const chunkSize = Number(process.env.CHUNK_SIZE);

module.exports.process = async (path) => {
    const files = await limit(() => splitFiles(path));
    await module.exports.convert(files);
};

module.exports.checkIfVideoEncoded = path => new Promise(async (resolve, reject) => {
    // ASSUMPTION: Duration gives the amount of files returned
    let counter = 0;
    const numFiles = Math.ceil(await getDuration(path) / chunkSize);
    const parentFolder = util.getParentFolder(path);
    const fileNameNoExt = util.removeFileExtension(util.getFileName(path));
    const unencodedFiles = [];

    fs.readdir(parentFolder, async (err, files) => {
        if (!err) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (util.isChunkedVideo(file)) {
                    const fileNoExt = util.removeFileExtension(util.getFileName(file));
                    if (fileNoExt.indexOf(fileNameNoExt) > -1) {
                        const fileExtension = util.getFileExtension(file);
                        if (fileExtension === 'mp4') {
                            counter += 1;
                            if (counter === numFiles) {
                                resolve({ encoded: true });
                                break;
                            }
                        } else {
                            unencodedFiles.push(`${parentFolder}\\${file}`);
                        }
                    }
                }
            }
            resolve({ encoded: false, files: unencodedFiles });
        }
        reject(err);
    });
});

module.exports.convert = paths => new Promise((resolve, reject) => {
    const tasks = paths.map(path => limit(() => encode(path)));
    Promise.all(tasks).then(resolve).catch(reject);
});

const splitFiles = path => new Promise((resolve, reject) => {
    // video duration in seconds
    getDuration(path).then((duration) => {
        const pathNoExt = util.removeFileExtension(path);
        const extension = util.getFileExtension(path);
        const fileName = `${pathNoExt}_%04d.${extension}`;
        const command = process.env.FFMPEG_PATH;
        const args = ['-i', path, '-c', 'copy', '-map', 0, '-segment_time', chunkSize, '-f', 'segment', fileName];
        const numFiles = Math.ceil(duration / chunkSize);
        // noinspection JSPotentiallyInvalidConstructorUsage
        const files = Array(numFiles)
            .fill()
            .map((_, i) => `${pathNoExt}_${String(i).padStart(4, '0')}.${extension}`);

        console.log(`Spawning ${command} ${args.join(' ')}`);
        const child = childProcess.spawn(command, args);
        child.stderr.setEncoding('utf-8');
        child.stderr.on('data', data => console.error(data));
        child.on('exit', (code, signal) => {
            if (!signal) {
                if (code === 0) {
                    console.log(`Successfully chunked ${path}`);
                    resolve(files);
                } else {
                    reject(`Exit code ${code} sent!`);
                }
            } else {
                reject(`Process signal ${signal} sent!`);
            }
        });
    });
});

const encode = path => new Promise((resolve, reject) => {
    const pathNoExt = util.removeFileExtension(path);
    const fileName = util.getFileName(path);
    const command = process.env.FFMPEG_PATH;
    const args = ['-i', path, '-f', 'mp4', '-vcodec', 'libx264', '-preset', 'fast', '-speed', 8, '-profile:v', 'main', '-acodec', 'aac', `${pathNoExt}.mp4`, '-hide_banner'];
    console.log(`Encoding ${path} to ${pathNoExt}.mp4`);
    console.log(`Spawning ${command} ${args.join(' ')}`);
    const child = childProcess.spawn(command, args);
    let message = '';

    child.stdin.setEncoding('utf-8');
    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data) => {
        message += data;
        if (message.indexOf('Overwrite ?') > -1) {
            child.stdin.write('y\n');
            child.stdin.end();
            message = '';
        }
        // console.error(data);
    });
    child.on('exit', (code, signal) => {
        if (!signal) {
            if (code === 0) {
                resolve();
                console.log(`Successfully encoded ${fileName}`);
                fs.unlink(path, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            } else {
                fs.unlink(`${pathNoExt}.mp4`, err => console.error(err));
                reject(`Exit code ${code} sent!`);
            }
        } else {
            fs.unlink(`${pathNoExt}.mp4`, err => console.error(err));
            reject(`Process signal ${signal} sent!`);
        }
    });
});

const getDuration = path => new Promise((resolve, reject) => {
    const command = process.env.FFPROBE_PATH;
    const args = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', path];
    let duration = '';

    console.log(`Getting duration of ${path}`);
    console.log(`Spawning ${command} ${args.join(' ')}`);

    const child = childProcess.spawn(command, args);
    child.stdout.on('data', (data) => {
        duration += data;
    });
    child.on('exit', (code, signal) => {
        if (!signal) {
            if (code === 0) {
                resolve(Number(duration));
            } else {
                reject(`Exit code ${code} sent!`);
            }
        } else {
            reject(`Process signal ${signal} sent!`);
        }
    });
});
