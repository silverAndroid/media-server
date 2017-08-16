/**
 * Created by silver_android on 5/17/2017.
 */

const chokidar = require('chokidar');
const tnp = require('torrent-name-parser');

const db = require('./models/db');
const directoriesModel = require('./models/directories_model');
const { logger } = require('./log');
const moviesModel = require('./models/movies_model');
const mpdGenerator = require('./mpd_generator');
const showsModel = require('./models/shows_model');
const showSeasonsModel = require('./models/shows_seasons_model');
const showEpisodesModel = require('./models/shows_episodes_model');
const tmdbAPI = require('./tmdb_api');
const util = require('./util');
const videoProcessor = require('./video_processing');

db.init().then(() => {
    logger.verbose('file_listen: init db');
    directoriesModel.getDirectories().then((directories) => {
        logger.verbose('file_listen: get directories');
        chokidar.watch(directories).on('add', async (path) => {
            const fileName = util.getFileName(path);

            // Checks if file is not a chunked video
            if (fileName.endsWith('.mkv') || fileName.endsWith('.avi')) {
                if (!util.isChunkedVideo(path)) {
                    const { encoded, files } = await videoProcessor.checkIfVideoEncoded(path);
                    logger.info(`${util.getFileName(path)} is ${encoded ? '' : 'not '}encoded`);
                    if (!encoded || files.length > 0) {
                        logger.debug(`Unencoded: ${files}`);
                        if (files.length === 0) {
                            await videoProcessor.process(path);
                        } else {
                            await videoProcessor.convert(files);
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
    const { title, season, episode, year } = tnp(fileName);
    const isEpisode = season !== undefined && episode !== undefined;

    if (isEpisode) {
        const { error, videoID } = await addShow(title, path, season, episode, year);
        if (!error) {
            logger.info(`TV Show - ${title} S${season}E${episode} added`);
            await mpdGenerator.addChunk(path, videoID, season, episode);
        }
    } else {
        await addMovie(title, path, year);
    }
}

async function addShow(name, path, season, episode, year) {
    const show = await getShow(name, season, episode, year);
    if (!show.error) {
        logger.verbose(`Inserting TV Show ${show.name} S${season}E${episode}`);
        return showsModel.add(show, path, year);
    }
    return { error: true };
}

async function getShow(name, seasonNumber, episodeNumber, year) {
    logger.verbose(`Checking if TV Show ${name} already exists`);
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
        logger.debug(`Retrieving TMDB data for ${name} S${seasonNumber}E${episodeNumber}`);
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
    logger.verbose(`Inserting movie ${name} (${year})`);
    logger.debug(`Retrieving TMDB data for ${name} (${year})`);
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
            logger.info(`Movie - ${name} (${year}) added`);
        }
    }
}
