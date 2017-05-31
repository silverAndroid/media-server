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
            'language': 'EN-US',
            'query': name
        }
    };
    if (year)
        options.qs.first_air_date_year = year;

    try {
        console.log('Waiting for response');
        const response = await limiter.schedule(rp, options);
        console.log('Received response');
        return {error: false, data: response.results[0]};
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
            'language': 'EN-US',
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