import mongoose from 'mongoose';
import User from '../models/user';
import SmsService from '../services/SmsService';
import uuid from 'uuid/v4';
import Cryptr from 'cryptr';

const mongoUrl = 'mongodb://localhost:27017/user-locations-dev';
const encriptionConstant = '9e648063-e9b2-467d-9bf6-14f590d7f73e';
let cryptr = new Cryptr(encriptionConstant);

exports.register = function(req, res) {
  mongoose.connect(mongoUrl);
  let user = req.body;

  if(!(req.body.phoneNumber && req.body.password)){
    res.status(400)        // HTTP status 404: NotFound
      .send('Need phone number and password')
  }

  // check if user already present
  User.find({phoneNumber: user.phoneNumber}, function(err, users){
    if (err){
      res.status(500)
        .send('something went wrong');
    }

    // if (users.length > 0){
    //   res.status(409)
    //     .send('User already present please login');
    // } else {
      user.password = cryptr.encrypt(req.body.password);
      user.id = uuid();
      let verificationCode = Math.floor(Math.random()*90000) + 10000;
      user.verificationCode = cryptr.encrypt(verificationCode);
      user.active = false;
      let savedUser = new User(user);

      savedUser.save(function(err) {
        if (err) throw err;

        // sms the verififcation code to user
        SmsService.sendVerificationCode(savedUser.phoneNumber, verificationCode);
        return res.json(savedUser);
      });
    //}
  });
};

exports.login = function(req, res) {
  mongoose.connect(mongoUrl);
  let credentials = req.body;

  if(!(credentials.phoneNumber && credentials.password)){
    res.status(400)        // HTTP status 404: NotFound
      .send('Need phone number and password')
  }

  User.findOne({phoneNumber: credentials.phoneNumber, active: true}, function(err, user){
    if (err){
      res.status(500)
        .send('something went wrong');
    }

    if (!user){
      res.status(401)
        .send('Invalid login or password');
    } else {
      let decrypted = cryptr.decrypt(user.password);
      if (decrypted === credentials.password){
        res.json({
          phoneNumber: user.phoneNumber
        });
      } else  {
        res.status(401)
          .send('Invalid login or password');
      }
    }
  });
};

exports.verify = function(req, res) {
  mongoose.connect(mongoUrl);

  let body = req.body;

  if(!(body.phoneNumber && body.verificationCode)){
    res.status(400)        // HTTP status 404: NotFound
      .send('Need phone number and verification code')
  }
  User.find({phoneNumber: body.phoneNumber, active: false}, function(err, users){
    if ( err || (users.length === 0)){
      res.status(404)        // HTTP status 404: NotFound
        .send('Not found')
    }

    let user = users[0];
    let verificationCode = cryptr.decrypt(user.verificationCode);

    if (verificationCode === body.verificationCode){
      user.active = true;
      user.save(function(err) {
        if (err) throw err;
        return res.json(user);
      });
    }
  });
}
