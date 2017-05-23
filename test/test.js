/**
 * Created by silver_android on 5/21/2017.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const mocha = require('mocha');
const server = require('../bin/www');
const directoriesModel = require('../models/directories_model');

const it = mocha.it;
const beforeEach = mocha.beforeEach;
const describe = mocha.describe;

chai.use(require('chai-http'));
chai.should();

describe('Movies', () => {
    beforeEach(async () => {
        await emptyDatabase();
        await directoriesModel.add('.');
    });

    it('GET /movies | Get all movies', done => {
        chai.request(server)
            .get('/api/movies')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('error').eql(false);
                res.body.should.have.property('movies');
                res.body.movies.should.be.a('array');
                res.body.movies.length.should.be.eql(1);
                res.body.movies[0].should.have.property('name');
                res.body.movies[0].should.have.property('name').eql('Star Wars Episode III Revenge of the Sith');
                res.body.movies[0].should.have.property('year');
                res.body.movies[0].should.have.property('year').eql(2005);
                done();
            });
    });

    it('GET /movies/:id | Get movie by id', done => {
        chai.request(server)
            .get('/api/movies/1')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('error').eql(false);
                res.body.should.have.property('movie');
                res.body.movie.should.be.a('object');
                res.body.movie.should.have.property('name');
                res.body.movie.should.have.property('name').eql('Star Wars Episode III Revenge of the Sith');
                res.body.movie.should.have.property('year');
                res.body.movie.should.have.property('year').eql(2005);
                done();
            });
    });

    it('GET /movies/:id | Fail to retrieve movie that does not exist', done => {
        chai.request(server)
            .get('/api/movies/2')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('error').eql(false);
                done();
            });
    });
});

describe('Shows', () => {
    beforeEach(async () => {
        await emptyDatabase();
        await directoriesModel.add('.');
    });

    it('GET /shows | Get all shows', done => {
        chai.request(server)
            .get('/api/shows')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('error').eql(false);
                res.body.should.have.property('shows');
                res.body.shows.should.be.a('array');
                res.body.shows.length.should.be.eql(1);
                res.body.shows[0].should.have.property('name');
                res.body.shows[0].should.have.property('name').eql('The Flash');
                done();
            });
    });

    it('GET /shows/:id | Get all seasons of show', done => {
        chai.request(server)
            .get('/api/shows/2')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('error').eql(false);
                res.body.should.have.property('seasons');
                res.body.seasons.should.be.a('array');
                res.body.seasons.length.should.be.eql(1);
                res.body.seasons[0].should.be.a('number');
                res.body.seasons[0].should.be.eql(3);
                done();
            });
    });

    it('GET /shows/:id/:season | Get all episodes of a season', done => {
        chai.request(server)
            .get('/api/shows/2/3')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('error').eql(false);
                res.body.should.have.property('season');
                res.body.season.should.be.a('array');
                res.body.season.length.should.be.eql(1);
                res.body.season[0].should.be.a('object');
                res.body.season[0].should.have.property('episode');
                res.body.season[0].should.have.property('episode').eql(21);
                done();
            });
    });
});

const emptyDatabase = async () => {
    const db = require('sqlite');
    try {
        await db.run('DELETE FROM users;');
    } catch (e) {
        console.error(e);
    }
};