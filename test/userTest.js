import mongoose from 'mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import User from '../src/models/user';
import App from '../src/srcServer';

const should = chai.should();
const expect = chai.expect;

process.env.NODE_ENV = 'test';
chai.use(chaiHttp);

describe('Authentication', () => {
    beforeEach((done) => {
        User.deleteMany({}, (err) => {
            done();
        });
    });

    describe('Register', () => {
        it('registers a new user', (done) => {
            let user = {
                "phoneNumber": "+917207565764",
                "password": "testpassword",
                "deviceId": "1234",
                "platform": "android"
            };

            chai.request(App)
                .post('/auth/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').eql(true);
                    done();
                });
        });

        it('requires a phone number', (done) => {
            let user = {
                "phoneNumber": "",
                "password": "testpassword",
                "deviceId": "1234",
                "platform": "android"
            };

            chai.request(App)
                .post('/auth/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.eq('Need phone number and password');
                    done();
                });
        });

        it('requires a password', (done) => {
            let user = {
                "phoneNumber": "+917207565764",
                "password": "",
                "deviceId": "1234",
                "platform": "android"
            };

            chai.request(App)
                .post('/auth/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.eq('Need phone number and password');
                    done();
                });
        });

        describe('when user is not present', () => {
            it('adds a  new user', (done) => {
                User.find({ phoneNumber: '+912345678902' }, (err, users) => {
                    users.length.should.eql(0);
                    let user = {
                        "phoneNumber": "+912345678902",
                        "password": "testpassword",
                        "deviceId": "1234",
                        "platform": "android"
                    };

                    chai.request(App)
                        .post('/auth/register')
                        .send(user)
                        .end((err, res) => {
                            User.find({ phoneNumber: '+912345678902' }, (err, users) => {
                                users.length.should.eql(1);
                                done();
                            });
                        });
                });
            });
        });

        describe('when user is present but not active', () => {
            beforeEach((done) => {
                let user = new User({
                    id: '1234',
                    phoneNumber: '+917207565764',
                    password: 'testpassword',
                    active: false
                });

                user.save((err) => {
                    done();
                });
            });

            it('does not add a  new user', (done) => {
                User.find({ phoneNumber: '+917207565764' }, (err, users) => {
                    users.length.should.eql(1);
                    let user = {
                        "phoneNumber": "+917207565764",
                        "password": "testpassword",
                        "deviceId": "1234",
                        "platform": "android"
                    };

                    chai.request(App)
                        .post('/auth/register')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property('success').eql(true);
                            User.find({ phoneNumber: '+917207565764' }, (err, users) => {
                                users.length.should.eql(1);
                                done();
                            });
                        });
                });
            });
        });

        describe('when user is already present and active', () => {
            beforeEach((done) => {
                let user = new User({
                    id: '1234',
                    phoneNumber: '+917207565764',
                    password: 'testpassword',
                    active: true
                });

                user.save((err) => {
                    done();
                });
            });

            it('fails to register', (done) => {
                let user = {
                    "phoneNumber": "+917207565764",
                    "password": "testpassword",
                    "deviceId": "1234",
                    "platform": "android"
                };

                chai.request(App)
                    .post('/auth/register')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(409);
                        res.text.should.eq('User already present please login');
                        done();
                    });
            });
        });
    });

    describe('Login', () => {
        beforeEach(done => {
            let user = {
                "phoneNumber": "+917207565764",
                "password": "testpassword",
                "deviceId": "1234",
                "platform": "android"
            };

            chai.request(App)
                .post('/auth/register')
                .send(user)
                .end((err, res) => {
                    expect(err).to.equal(null);
                    // activate the user
                    User.find({ phoneNumber: '+917207565764' }, (err, users) => {
                        let user = users[0];
                        user.active = true;
                        user.save(err => {
                            expect(err).to.equal(null);
                            done();
                        });
                    });
                });
        });

        it('logs the user in with right credentials', (done) => {
            chai.request(App)
                .post('/auth/login')
                .send({ phoneNumber: '+917207565764', password: 'testpassword' })
                .end((err, res) => {
                    expect(err).to.equal(null);
                    expect(res.status).to.equal(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.property('token')
                    done();
                });
        });

        it('fails to login with wrong password', (done) => {
            chai.request(App)
                .post('/auth/login')
                .send({ phoneNumber: '+917207565764', password: 'wrongpassword' })
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.text).to.equal('Invalid login or password');
                    done();
                });
        });

        it('fails to login with wrong phone number', (done) => {
            chai.request(App)
                .post('/auth/login')
                .send({ phoneNumber: '+917207565765', password: 'testpassword' })
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.text).to.equal('Invalid login or password');
                    done();
                });
        });
    })
});
