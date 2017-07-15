/**
 * Created by silver_android on 5/17/2017.
 */

const chokidar = require('chokidar');
const tnp = require('torrent-name-parser');
const fs = require('fs');

const db = require('./models/db');
const directoriesModel = require('./models/directories_model');
const showsModel = require('./models/shows_model');
const moviesModel = require('./models/movies_model');
const tmdbAPI = require('./tmdb_api');
const videoProcessor = require('./video_processing');

db.init().then(() => {
    console.log('file_listen: init db');
    directoriesModel.getDirectories().then(directories => {
        console.log('file_listen: get directories');
        chokidar.watch(directories).on('add', async (path) => {
            const directories = path.split('\\');
            const fileName = directories.pop();

            // Checks if file is not a chunked video
            if (fileName.match(/.+_\d{4,}\./) === null) {
                if (fileName.endsWith('.mkv') || fileName.endsWith('.avi')) {
                    const fileNameNoExt = fileName.split(/\.[^/.]+$/)[0];
                    fs.readdir(directories.join('\\'), async (err, files) => {
                        if (!err) {
                            if (!files.some(file => file.split(/\.[^/.]+$/)[0] !== fileNameNoExt && file.indexOf(fileNameNoExt) > -1)) {
                                await videoProcessor.process(path);
                            }
                        }
                    });
                }
            } else {
                if (fileName.endsWith('.mp4')) {
                    await parseFile(fileName, path);
                }
            }
        });
    });
});

const parseFile = async (fileName, path) => {
    const file = tnp(fileName);
    const isEpisode = file.season !== undefined && file.episode !== undefined;

    if (isEpisode) {
        await addShow(file.title, path, file.season, file.episode, file.year);
    } else {
        await addMovie(file.title, path, file.year);
    }
};

const addShow = async (name, path, season, episode, year) => {
    const show = await getShow(name, season, episode, year);
    if (!show.error) {
        console.log(`Inserting TV Show ${show.name} S${season}E${episode}`);
        const isError = await showsModel.add(show, path, year);
        if (!isError.error) {
            console.log(`TV Show - ${name} S${season}E${episode} added`);
        }
    }
};

const getShow = async (name, seasonNumber, episodeNumber, year) => {
    const showSeasonsModel = require('./models/shows_seasons_model');
    const showEpisodesModel = require('./models/shows_episodes_model');

    console.log(`Checking if TV Show ${name} already exists`);
    let [show, season, episode] = await Promise.all([
        showsModel.getShow({name, year}),
        showSeasonsModel.get(name, seasonNumber, year),
        showEpisodesModel.get(name, seasonNumber, episodeNumber, year)
    ]);

    show = await parseShow(show, name, seasonNumber, episodeNumber, year);
    const result = await getSeasonEpisode(show, season, episode, seasonNumber, episodeNumber);
    season = result.season;
    episode = result.episode;

    show.season = season;
    show.episode = episode;

    return show;
};

const parseShow = async (show, name, seasonNumber, episodeNumber, year) => {
    if (!show.data) {
        console.log(`Retrieving TMDB data for ${name} S${seasonNumber}E${episodeNumber}`);
        // image_url: poster_path, tmdb_id: id, overview: overview
        const showRes = await tmdbAPI.getTMDBShow(name, year);

        show = {
            name: showRes.data.name,
            error: showRes.error,
            year,
            tmdbID: showRes.data.id,
            imageURL: showRes.data.poster_path,
            overview: showRes.data.overview
        };
    } else {
        show.imageURL = show.data.image_url;
        show.tmdbID = show.data.tmdb_id;
        show.overview = show.data.overview;
        show.name = show.data.name;

        delete show.data;
    }

    return show;
};

const getSeasonEpisode = async (show, season, episode, seasonNumber, episodeNumber) => {
    let requests = [];
    if (!season.data) {
        requests.push(tmdbAPI.getTMDBSeason(show.tmdbID, seasonNumber));
    } else {
        requests.push(Promise.resolve(null));
        season = season.data;
    }

    if (!episode.data) {
        requests.push(tmdbAPI.getTMDBEpisode(show.tmdbID, seasonNumber, episodeNumber));
    } else {
        requests.push(Promise.resolve(null));
        episode = episode.data;
    }

    const [seasonRes, episodeRes] = await Promise.all(requests);
    if (seasonRes && !seasonRes.error) {
        season = {
            season: seasonRes.data.season_number,
            imageURL: seasonRes.data.poster_path,
            overview: seasonRes.data.overview
        };
    }

    if (episodeRes && !episodeRes.error) {
        episode = {
            name: episodeRes.data.name,
            season: episodeRes.data.season_number,
            episode: episodeRes.data.episode_number,
            imageURL: episodeRes.data.still_path,
            overview: episodeRes.data.overview
        };
    }

    return {season, episode};
};

const addMovie = async (name, path, year) => {
    console.log(`Inserting movie ${name} (${year})`);
    console.log(`Retrieving TMDB data for ${name} (${year})`);
    const movie = await tmdbAPI.getTMDBMovie(name, year);
    if (!movie.error) {
        const movieData = movie.data;
        const isError = await moviesModel.add(name, path, movieData.id, movieData.poster_path, movieData.overview, year);
        if (!isError.error) {
            console.log(`Movie - ${name} (${year}) added`);
        }
    }
};

const getMovie = async (name, year) => {

};