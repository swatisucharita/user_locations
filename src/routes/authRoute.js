import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import SmsService from '../services/smsService';
import notificationService from '../services/notificationService';
import uuid from 'uuid/v4';
import Cryptr from 'cryptr';
import { appConstants } from '../services/constants';

const encriptionConstant = appConstants.encriptionConstant;
const secret = appConstants.secret;

let cryptr = new Cryptr(encriptionConstant);

let sendVerificationCode = (user) => {
    let verificationCode = Math.floor(Math.random() * 90000) + 10000;
    user.verificationCode = cryptr.encrypt(verificationCode);

    return user.save(function (err) {
      if (err) throw err;

      // sms the verififcation code to user
      SmsService.sendVerificationCode(user.phoneNumber, verificationCode);
      return user;
    });
  }

class AuthRoute {

  register(req, res) {
    let user = req.body;
    let self = this;

    if (!(req.body.phoneNumber && req.body.password)) {
      res.status(400)        // HTTP status 404: NotFound
        .send('Need phone number and password');
    }

    // check if user already present
    User.findOne({ phoneNumber: user.phoneNumber }, function (err, existingUser) {
      if (err) {
        res.status(500)
          .send('something went wrong');
      }

      if (existingUser) {
        if (existingUser.active) {
          res.status(409)
            .send('User already present please login');
        } else {
          existingUser.deviceId = user.deviceId;
          existingUser.platform = user.platform;
          notificationService.addDevice(existingUser.deviceId, existingUser.platform).then((result) => {
            existingUser.oneSignalId = result;
            sendVerificationCode(existingUser).then((u) => {

              return res.json({ success: true });
            });
          }, (err) => {
          });
        }
      } else {
        user.password = cryptr.encrypt(req.body.password);
        user.id = uuid();
        user.active = false;
        let savedUser = new User(user);
        notificationService.addDevice(savedUser.deviceId, savedUser.platform).then(function (result) {
          savedUser.oneSignalId = result;
          sendVerificationCode(savedUser).then((u) => {
            return res.json({ success: true });
          });
        }, function (err) {
        });
      }
    }.bind(this));
  }

  login(req, res) {
    let credentials = req.body;

    if (!(credentials.phoneNumber && credentials.password)) {
      res.status(400)        // HTTP status 404: NotFound
        .send('Need phone number and password');
    }

    User.findOne({ phoneNumber: credentials.phoneNumber, active: true }, function (err, user) {
      if (err) {
        res.status(500)
          .send('something went wrong');
      }

      if (!user) {
        res.status(401)
          .send('Invalid login or password');
      } else {
        let decrypted = cryptr.decrypt(user.password);

        if (decrypted !== credentials.password) {
          return res.status(401)
            .send('Invalid login or password');

        } else {

          // create a token
          let token = jwt.sign(user, secret, {
            expiresIn: '24h' // expires in 24 hours
          });

          res.json({
            success: true,
            phoneNumber: user.phoneNumber,
            userId: user._id,
            token: token
          });
        }
      }
    });
  }

  verify(req, res) {
    let body = req.body;

    if (!(body.phoneNumber && body.verificationCode)) {
      res.status(400)        // HTTP status 404: NotFound
        .send('Need phone number and verification code');
    }
    User.find({ phoneNumber: body.phoneNumber, active: false }, function (err, users) {
      if (err || (users.length === 0)) {
        res.status(404)        // HTTP status 404: NotFound
          .send('Not found');
      }

      let user = users[0];
      let verificationCode = cryptr.decrypt(user.verificationCode);

      if (verificationCode === body.verificationCode) {
        user.active = true;
        user.save(function (err) {
          if (err) throw err;
          return res.json({ success: true });
        });
      } else {
        res.status(401)
          .send('Invalid verification code');
      }
    });
  }
}

let authRoute = new AuthRoute();
export default authRoute;
