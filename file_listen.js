/**
 * Created by silver_android on 5/17/2017.
 */

const chokidar = require('chokidar');
const tnp = require('torrent-name-parser');
const directoriesModel = require('./models/directories_model');
const showsModel = require('./models/shows_model');
const moviesModel = require('./models/movies_model');

module.exports.init = async () => {
    const directories = await directoriesModel.getDirectories();
    chokidar.watch(directories).on('add', async (path) => {
        const folderTree = path.split('\\');
        const file = folderTree[folderTree.length - 1];
        if (file.endsWith('.mp4') || file.endsWith('.mkv') || file.endsWith('.avi')) {
            const parsedFile = tnp(file);
            const isEpisode = parsedFile.season !== undefined && parsedFile.episode !== undefined;

            if (isEpisode) {
                console.log(`Inserting TV Show ${parsedFile.title} S${parsedFile.season}E${parsedFile.episode}`);
                const isError = await showsModel.add(parsedFile.title, path, parsedFile.season, parsedFile.episode, parsedFile.year);
                if (!isError.error) {
                    console.log(`TV Show - ${parsedFile.title} S${parsedFile.season}E${parsedFile.episode} added`);
                }
            } else {
                console.log(`Inserting movie ${parsedFile.title} (${parsedFile.year})`);
                const isError = await moviesModel.add(parsedFile.title, path, parsedFile.year);
                if (!isError.error) {
                    console.log(`Movie - ${parsedFile.title} (${parsedFile.year}) added`);
                }
            }
        }
    });
};