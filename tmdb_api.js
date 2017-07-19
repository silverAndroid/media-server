/**
 * Created by silver_android on 5/23/2017.
 */

const rp = require('request-promise');
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck(4, 1000);
const promises = {};

module.exports.getTMDBShow = async (name, year) => {
    const options = {
        url: 'https://api.themoviedb.org/3/search/tv',
        qs: {
            api_key: process.env.TMDB_API_KEY,
            query: name,
        },
        json: true,
    };
    if (year) {
        options.qs.first_air_date_year = year;
    }

    try {
        const response = await getPromise(rp, [options], name, year, 'TV');
        return { error: false, data: response.results[0] };
    } catch (e) {
        console.error(e);
        return { error: true };
    }
};

module.exports.getTMDBSeason = async (tmdbID, season) => {
    const options = {
        url: `https://api.themoviedb.org/3/tv/${tmdbID}/season/${season}`,
        qs: {
            api_key: process.env.TMDB_API_KEY,
        },
        json: true,
    };
    try {
        console.log(`Waiting for ${tmdbID} S${season}`);
        const response = await getPromise(rp, [options], tmdbID, season);
        console.log(`Received response from ${tmdbID} S${season}`);
        return { error: false, data: response };
    } catch (e) {
        console.error(e);
        return { error: true };
    }
};

module.exports.getTMDBEpisode = async (tmdbID, season, episode) => {
    const options = {
        url: `https://api.themoviedb.org/3/tv/${tmdbID}/season/${season}/episode/${episode}`,
        qs: {
            api_key: process.env.TMDB_API_KEY,
        },
        json: true,
    };
    try {
        console.log(`Waiting for ${tmdbID} S${season} E${episode}`);
        const response = await getPromise(rp, [options], tmdbID, season, episode);
        console.log(`Received response from ${tmdbID} S${season} E${episode}`);
        return { error: false, data: response };
    } catch (e) {
        console.error(e);
        return { error: true };
    }
};

module.exports.getTMDBMovie = async (name, year) => {
    const options = {
        url: 'https://api.themoviedb.org/3/search/movie',
        qs: {
            api_key: process.env.TMDB_API_KEY,
            query: name,
            year,
        },
        json: true,
    };
    try {
        const response = await getPromise(rp, [options], name, year, 'movie');
        return { error: false, data: response.results[0] };
    } catch (e) {
        console.error(e);
        return { error: true };
    }
};

function generateID(...params) {
    return params.map(param => String(param)).join('');
}

function getPromise(fn, args, ...params) {
    const id = generateID(params);
    if (!Object.prototype.hasOwnProperty.call(promises, id)) {
        promises[id] = limiter.schedule(fn, ...args);
    }
    return promises[id];
}
