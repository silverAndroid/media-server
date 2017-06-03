/**
 * Created by silver_android on 5/23/2017.
 */

const rp = require('requestretry').defaults({
    json: true,
    fullResponse: false,
    retryStrategy: retryRateLimitPassed,
    retryDelay: 2000
});
const Bottleneck = require('bottleneck');
const limiter = new Bottleneck(4, 1000);

module.exports.getTMDBShow = async (name, year) => {
    const options = {
        url: 'https://api.themoviedb.org/3/search/tv',
        qs: {
            'api_key': process.env.TMDB_API_KEY,
            'query': name
        }
    };
    if (year)
        options.qs.first_air_date_year = year;

    try {
        const response = await limiter.schedule(rp, options);
        return {error: false, data: response.results[0]};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getTMDBSeason = async (tmdbID, season) => {
    const options = {
        url: `https://api.themoviedb.org/3/tv/${tmdbID}/season/${season}`,
        qs: {
            'api_key': process.env.TMDB_API_KEY
        }
    };
    try {
        console.log(`Waiting for ${tmdbID} S${season}`);
        const response = await limiter.schedule(rp, options);
        console.log(`Received response from ${tmdbID} S${season}`);
        return {error: false, data: response};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getTMDBEpisode = async (tmdbID, season, episode) => {
    const options = {
        url: `https://api.themoviedb.org/3/tv/${tmdbID}/season/${season}/episode/${episode}`,
        qs: {
            'api_key': process.env.TMDB_API_KEY
        }
    };
    try {
        console.log(`Waiting for ${tmdbID} S${season} E${episode}`);
        const response = await limiter.schedule(rp, options);
        console.log(`Received response from ${tmdbID} S${season} E${episode}`);
        return {error: false, data: response};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

module.exports.getTMDBMovie = async (name, year) => {
    const options = {
        url: 'https://api.themoviedb.org/3/search/movie',
        qs: {
            'api_key': process.env.TMDB_API_KEY,
            'query': name,
            year
        }
    };
    try {
        const response = await limiter.schedule(rp, options);
        return {error: false, data: response.results[0]};
    } catch (e) {
        console.error(e);
        return {error: true};
    }
};

function retryRateLimitPassed(err, response) {
    if (err) {
        console.log('Error occurred');
        console.error(err);
    }
    if (response.statusCode === 429)
        console.log('Rate limit reached...');
    return err || response.statusCode === 429;
}