import mongoose from 'mongoose';
import chai from 'chai';
import chaiHttp from 'chai-http';
import User from '../src/models/user';
import App from '../src/srcServer';

const expect = chai.expect;

process.env.NODE_ENV = 'test';
chai.use(chaiHttp);

describe('Locations', () => {
    let loggedInUser = {};
    beforeEach(done => {
        // register a user
        // TO DO: seed data into test db
        User.remove({}, (err) => {
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
                            chai.request(App)
                                .post('/auth/login')
                                .send({ phoneNumber: '+917207565764', password: 'testpassword' })
                                .end((err, res) => {
                                    expect(err).to.equal(null);
                                    loggedInUser = res.body;
                                    done();
                                });
                        });
                    });
                });
        });
    });

    describe('Get Locations', () => {
        it.only('returns all the locations of  the user', () => {
            chai.request(App)
                .get(`/api/locations?userId=${loggedInUser.userId}`)
                .end((err, res) => {
                    expect(err).to.equal(null);
                    expect(res).to.equal([]);
                    done();
                });
        });
    });


});