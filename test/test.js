/**
 * Created by silver_android on 5/21/2017.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const mocha = require('mocha');

const server = require('../bin/www');
const directoriesModel = require('../models/directories_model');

const before = mocha.before;
const it = mocha.it;
const beforeEach = mocha.beforeEach;
const describe = mocha.describe;

chai.use(require('chai-http'));
chai.should();

before(async () => {
    const db = require('../models/db');
    const fileListen = require('../file_listen');

    await db.init();
    await directoriesModel.add('./test');
    await fileListen.init();
    await new Promise(resolve => setTimeout(resolve, 7000));
});

describe('Movies', () => {
    beforeEach(async () => {
        await emptyDatabase();
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
        await directoriesModel.add('./test');
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
                res.body.shows[0].should.be.a('object');
                res.body.shows[0].should.have.property('name');
                res.body.shows[0].should.have.property('name').eql('The Flash');
                res.body.shows[0].should.have.property('overview');
                res.body.shows[0].should.have.property('overview').eql('After a particle accelerator causes a freak storm, CSI Investigator Barry Allen is struck by lightning and falls into a coma. Months later he awakens with the power of super speed, granting him the ability to move through Central City like an unseen guardian angel. Though initially excited by his newfound powers, Barry is shocked to discover he is not the only \"meta-human\" who was created in the wake of the accelerator explosion -- and not everyone is using their new powers for good. Barry partners with S.T.A.R. Labs and dedicates his life to protect the innocent. For now, only a few close friends and associates know that Barry is literally the fastest man alive, but it won\'t be long before the world learns what Barry Allen has become...The Flash.');
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
                res.body.seasons[0].should.be.a('object');
                res.body.seasons[0].should.have.property('season');
                res.body.seasons[0].should.have.property('season').eql(3);
                res.body.seasons[0].should.have.property('overview');
                res.body.seasons[0].should.have.property('overview').eql('');
                done();
            });
    });

    it('GET /shows/:id | Fail to retrieve seasons of a show that does not exist', done => {
        chai.request(server)
            .get('/api/shows/5')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('error').eql(false);
                res.body.should.have.property('seasons');
                res.body.seasons.should.be.a('array');
                res.body.seasons.length.should.be.eql(0);
                done();
            })
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
                res.body.season[0].should.have.property('overview');
                res.body.season[0].should.have.property('overview').eql('Barry takes drastic measures to stop Savitar. Meanwhile, H.R. continues to push Tracy Brand to design the trap for Savitar and Killer Frost returns with an interesting proposal.');
                res.body.season[0].should.have.property('image_url');
                res.body.season[0].should.have.property('image_url').eql('/3jVaJYz5v8SGXH8SNk4QJ6JhVMU.jpg');
                done();
            });
    });

    it('GET /shows/:id/:season | Fail to retrieve episodes for a season that does not exist', done => {
        chai.request(server)
            .get('/api/shows/2/4')
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.should.have.property('error').eql(false);
                res.body.should.have.property('season');
                res.body.season.should.be.a('array');
                res.body.season.length.should.be.eql(0);
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