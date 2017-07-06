/**
 * Created by silver_android on 6/12/2017.
 */
const childProcess = require('child_process');
const fs = require('fs');
const getDuration = require('get-video-duration');
const promiseLimit = require('promise-limit');
const limit = promiseLimit(Number(process.env.MAX_FFMPEG_PROCESSES));

const chunkSize = Number(process.env.CHUNK_SIZE);

module.exports.process = async (path) => {
    const files = await limit(() => splitFiles(path));
    await convert(files);
    return concatenate(path);
};

const splitFiles = (path) => {
    return new Promise((resolve, reject) => {
        // video duration in seconds
        getDuration(path).then(duration => {
            const pathNoExt = path.split(/\.[^/.]+$/)[0];
            const extension = path.split('.').pop();
            const fileName = `${pathNoExt}_%04d.${extension}`;
            const command = process.env.FFMPEG_PATH;
            const args = ['-i', path, '-c', 'copy', '-map', 0, '-segment_time', chunkSize, '-f', 'segment', fileName];
            const concatFile = `${path}.txt`;
            const numFiles = Math.ceil(duration / chunkSize);
            const files = Array(numFiles)
                .fill()
                .map((_, i) => `file '${pathNoExt}_${String(i).padStart(4, '0')}.mp4'`);

            console.log(`Spawning ${command} ${args.join(' ')}`);
            const child = childProcess.spawn(command, args);
            child.on('exit', (code, signal) => {
                if (!signal) {
                    if (code === 0) {
                        console.log(`Successfully chunked ${path} to ${fileName}`);
                        resolve(files.map(file => file.replace('.mp4', `.${extension}`)));
                    } else {
                        reject(`Exit code ${code} sent!`);
                    }
                } else {
                    reject(`Process signal ${signal} sent!`);
                }
            });
            fs.writeFile(concatFile, files.join('\n'), err => {
                if (err)
                    reject(err);
            });
        });
    });
};

const convert = (paths) => {
    return new Promise((resolve, reject) => {
        const tasks = paths.map(path => {
            path = path.match(/file '(.+)'/)[1];
            return limit(() => encode(path))
        });
        Promise.all(tasks).then(resolve).catch(reject);
    });
};

const encode = (path) => {
    return new Promise((resolve, reject) => {
        const pathNoExt = path.split(/\.[^/.]+$/)[0];
        const fileName = path.split('\\').pop();
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
                    fs.unlink(path, err => {
                        if (err) {
                            console.error(err);
                        }
                    })
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
};

const concatenate = (path) => {
    return new Promise((resolve, reject) => {
        const pathNoExt = path.split(/\.[^/.]+$/)[0];
        const fileName = `${pathNoExt}.mp4`;
        const command = process.env.FFMPEG_PATH;
        const args = ['-f', 'concat', '-safe', 0, '-i', `${path}.txt`, '-c', 'copy', fileName];

        console.log(`Merging the chunks to ${fileName}`);
        console.log(`Spawning ${command} ${args.join(' ')}`);

        const child = childProcess.spawn(command, args);
        child.on('exit', (code, signal) => {
            if (!signal) {
                if (code === 0) {
                    resolve();
                    console.log(`Successfully merged ${fileName}`);
                } else {
                    reject(`Exit code ${code} sent!`);
                }
            } else {
                reject(`Process signal ${signal} sent!`);
            }
        });
    });
};