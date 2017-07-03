/**
 * Created by silver_android on 6/12/2017.
 */
const childProcess = require('child_process');
const fs = require('fs');
const getDuration = require('get-video-duration');
const promiseLimit = require('promise-limit');
const limit = promiseLimit(10);

const chunkSize = Number(process.env.CHUNK_SIZE);

module.exports.process = async (path, pathNoExt) => {
    const files = await splitFiles(path, pathNoExt);
    await convert(files);
};

const splitFiles = (path, pathNoExt) => {
    return new Promise((resolve, reject) => {
        // video duration in seconds
        getDuration(path).then(duration => {
            const extension = path.split('.').pop();
            const fileName = `${pathNoExt}_%03d.${extension}`;
            const command = process.env.FFMPEG_PATH;
            const args = ['-i', path, '-c', 'copy', '-map', 0, '-segment_time', chunkSize, '-f', 'segment', fileName];
            const concatFile = `${path}.txt`;
            const numFiles = Math.ceil(duration / chunkSize);
            const files = Array(numFiles)
                .fill()
                .map((_, i) => `file '${pathNoExt}_${String(i).padStart(3, '0')}.${extension}'`);

            console.log(`Spawning ${command} ${args.join(' ')}`);
            const child = childProcess.spawn(command, args);
            child.on('exit', (code, signal) => {
                if (!signal) {
                    if (code === 0) {
                        console.log(`Successfully chunked ${path} to ${fileName}`);
                        resolve(files);
                    }
                }
            });
            fs.writeFile(concatFile, files.join('\n'), err => {
                if (err)
                    reject(err);
            });
        });
    });
};