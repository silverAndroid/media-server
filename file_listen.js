/**
 * Created by silver_android on 5/17/2017.
 */

const chokidar = require('chokidar');
const tnp = require('torrent-name-parser');

const directoriesModel = require('./models/directories_model');
const showsModel = require('./models/shows_model');
const moviesModel = require('./models/movies_model');
const tmdbAPI = require('./tmdb_api');

module.exports.init = async () => {
    const directories = await directoriesModel.getDirectories();
    chokidar.watch(directories).on('add', async (path) => {
        const folderTree = path.split('\\');
        const fileName = folderTree[folderTree.length - 1];
        if (fileName.endsWith('.mp4') || fileName.endsWith('.mkv') || fileName.endsWith('.avi')) {
            const file = tnp(fileName);
            const isEpisode = file.season !== undefined && file.episode !== undefined;

            if (isEpisode) {
                await addShow(file.title, path, file.season, file.episode, file.year);
            } else {
                await addMovie(file.title, path, file.year);
            }
        }
    });
};

const addShow = async (name, path, season, episode, year) => {
    const show = await getShow(name, season, episode, year);
    if (!show.error) {
        console.log(`Inserting TV Show ${show.name} S${season}E${episode}`);
        const isError = await showsModel.add(show.name, path, season, episode, show.tmdbID, show.imageURL, show.overview, year);
        if (!isError.error) {
            console.log(`TV Show - ${name} S${season}E${episode} added`);
        }
    }
};

const getShow = async (name, season, episode, year) => {
    console.log(`Checking if TV Show ${name} already exists`);
    let show = await showsModel.getShow(name, year);
    let imageURL, tmdbID, error;
    if (!show.show) {
        console.log(`Retrieving TMDB data for ${name} S${season}E${episode}`);
        // image_url: poster_path, tmdb_id: id, overview: overview
        show = await tmdbAPI.getTMDBShow(name, year);
        error = show.error;
        show = show.data;
        delete show.data;

        imageURL = show.poster_path;
        tmdbID = show.id;
    } else {
        error = show.error;
        show = show.show;
        imageURL = show.image_url;
        tmdbID = show.tmdb_id;
    }

    show.imageURL = imageURL;
    show.tmdbID = tmdbID;
    show.error = error;

    return show;
};

const addMovie = async (name, path, year) => {
    console.log(`Inserting movie ${name} (${year})`);
    console.log(`Retrieving TMDB data for ${name} (${year})`);
    const movie = await tmdbAPI.getTMDBMovie(name, year);
    console.log(`TMDB error: ${movie.error}`);
    if (!movie.error) {
        const movieData = movie.data;
        const isError = await moviesModel.add(name, path, movieData.id, movieData.poster_path, movieData.overview, year);
        console.log(`DB error: ${isError.error}`);
        if (!isError.error) {
            console.log(`Movie - ${name} (${year}) added`);
        }
    }
};