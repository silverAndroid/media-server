/**
 * Created by silver_android on 5/21/2017.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const mocha = require('mocha');
const server = require('../bin/www');

const it = mocha.it;
const beforeEach = mocha.beforeEach;
const describe = mocha.describe;

chai.use(require('chai-http'));

describe('Movies', () => {
    beforeEach(async () => {
        await emptyDatabase();
        const directoriesModel = require('../models/directories_model');
        await directoriesModel.add(process.env.TEST_VIDEO_FOLDER);
    });

    it('GET /movies | Get all movies', done => {
        chai.request(server)
            .get('/api/movies')
            .end((err, res) => {
                console.log(res.body);
                done();
            });
    });
});

const emptyDatabase = async () => {
    const db = require('sqlite');
    try {
        await db.run('DELETE FROM video_names;');
        await db.run('DELETE FROM directories;');
        await db.run('DELETE FROM users;');
    } catch (e) {
        console.error(e);
    }
};