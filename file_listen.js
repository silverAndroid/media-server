/**
 * Created by silver_android on 5/17/2017.
 */

const chokidar = require('chokidar');
const tnp = require('torrent-name-parser');

const db = require('./models/db');
const directoriesModel = require('./models/directories_model');
const moviesModel = require('./models/movies_model');
const showsModel = require('./models/shows_model');
const showSeasonsModel = require('./models/shows_seasons_model');
const showEpisodesModel = require('./models/shows_episodes_model');
const tmdbAPI = require('./tmdb_api');
const util = require('./util');
const videoProcessor = require('./video_processing');

db.init().then(() => {
    console.log('file_listen: init db');
    directoriesModel.getDirectories().then((directories) => {
        console.log('file_listen: get directories');
        chokidar.watch(directories).on('add', async (path) => {
            const fileName = util.getFileName(path);

            // Checks if file is not a chunked video
            if (fileName.endsWith('.mkv') || fileName.endsWith('.avi')) {
                if (!util.isChunkedVideo(path)) {
                    const isEncoded = await videoProcessor.checkIfVideoEncoded(path);
                    console.log(`${util.getFileName(path)} is ${isEncoded.encoded ? '' : 'not '}encoded`);
                    if (!isEncoded.encoded) {
                        console.log('Unencoded: ', isEncoded.files);
                        if (isEncoded.files.length === 0) {
                            await videoProcessor.process(path);
                        } else {
                            await videoProcessor.convert(isEncoded.files);
                        }
                    }
                }
            } else if (fileName.endsWith('.mp4')) {
                await parseFile(fileName, path);
            }
        });
    });
});

async function parseFile(fileName, path) {
    const file = tnp(fileName);
    const isEpisode = file.season !== undefined && file.episode !== undefined;

    if (isEpisode) {
        await addShow(file.title, path, file.season, file.episode, file.year);
    } else {
        await addMovie(file.title, path, file.year);
    }
}

async function addShow(name, path, season, episode, year) {
    const show = await getShow(name, season, episode, year);
    if (!show.error) {
        console.log(`Inserting TV Show ${show.name} S${season}E${episode}`);
        const isError = await showsModel.add(show, path, year);
        if (!isError.error) {
            console.log(`TV Show - ${name} S${season}E${episode} added`);
        }
    }
}

async function getShow(name, seasonNumber, episodeNumber, year) {
    console.log(`Checking if TV Show ${name} already exists`);
    let [show, season, episode] = await Promise.all([
        showsModel.getShow({ name, year }),
        showSeasonsModel.get(name, seasonNumber, year),
        showEpisodesModel.get(name, seasonNumber, episodeNumber, year),
    ]);

    show = await parseShow(show, name, seasonNumber, episodeNumber, year);
    const result = await getSeasonEpisode(show, season, episode, seasonNumber, episodeNumber);
    season = result.season;
    episode = result.episode;

    show.season = season;
    show.episode = episode;

    return show;
}

async function parseShow(show, name, seasonNumber, episodeNumber, year) {
    let showObj = show;
    if (!showObj.data) {
        console.log(`Retrieving TMDB data for ${name} S${seasonNumber}E${episodeNumber}`);
        // image_url: poster_path, tmdb_id: id, overview: overview
        const showRes = await tmdbAPI.getTMDBShow(name, year);

        showObj = {
            name: showRes.data.name,
            error: showRes.error,
            year,
            tmdbID: showRes.data.id,
            imageURL: showRes.data.poster_path,
            overview: showRes.data.overview,
        };
    } else {
        showObj.imageURL = showObj.data.image_url;
        showObj.tmdbID = showObj.data.tmdb_id;
        showObj.overview = showObj.data.overview;
        showObj.name = showObj.data.name;

        delete showObj.data;
    }

    return showObj;
}

async function getSeasonEpisode(show, season, episode, seasonNumber, episodeNumber) {
    const requests = [];
    let seasonData;
    let episodeData;
    if (!season.data) {
        requests.push(tmdbAPI.getTMDBSeason(show.tmdbID, seasonNumber));
    } else {
        requests.push(Promise.resolve(null));
        seasonData = season.data;
    }

    if (!episode.data) {
        requests.push(tmdbAPI.getTMDBEpisode(show.tmdbID, seasonNumber, episodeNumber));
    } else {
        requests.push(Promise.resolve(null));
        episodeData = episode.data;
    }

    const [seasonRes, episodeRes] = await Promise.all(requests);
    if (seasonRes && !seasonRes.error) {
        seasonData = {
            season: seasonRes.data.season_number,
            imageURL: seasonRes.data.poster_path,
            overview: seasonRes.data.overview,
        };
    }

    if (episodeRes && !episodeRes.error) {
        episodeData = {
            name: episodeRes.data.name,
            season: episodeRes.data.season_number,
            episode: episodeRes.data.episode_number,
            imageURL: episodeRes.data.still_path,
            overview: episodeRes.data.overview,
        };
    }

    return { season: seasonData, episode: episodeData };
}

async function addMovie(name, path, year) {
    console.log(`Inserting movie ${name} (${year})`);
    console.log(`Retrieving TMDB data for ${name} (${year})`);
    const movie = await tmdbAPI.getTMDBMovie(name, year);
    if (!movie.error) {
        const movieData = movie.data;
        const isError = await moviesModel.add(
            name,
            path,
            movieData.id,
            movieData.poster_path,
            movieData.overview,
            year,
        );
        if (!isError.error) {
            console.log(`Movie - ${name} (${year}) added`);
        }
    }
}
