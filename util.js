/**
 * Created by Rushil on 7/17/2017.
 */
module.exports.removeFileExtension = path => path.split(/\.[^/.]+$/)[0];

module.exports.getFileExtension = path => path.split('.').pop();

module.exports.getFileName = path => path.split(/[/\\]/).pop();

module.exports.isChunkedVideo = path => module.exports.getFileName(path).match(/.+_\d{4,}\./) !== null;

module.exports.getChunkNumber = path => Number(module.exports.getFileName(path).match(/.+_(\d{4,})\./)[1]);

module.exports.removeChunkEnding = path => (module.exports.isChunkedVideo(path) ? path.replace(path.match(/(_\d{4,})\.[^/.]+$/)[1], '') : path);

module.exports.getParentFolder = (path) => {
    const parentFolder = path.split(/[/\\]/);
    parentFolder.pop();
    return parentFolder.join('\\');
};
