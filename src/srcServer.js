import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import webpack from 'webpack';
import jwt from 'jsonwebtoken';
import path from 'path';
import mongoose from 'mongoose';

import config from '../webpack.config.dev';
import authRoute from './routes/authRoute';
import locationRoute from './routes/locationRoute';
import {appConstants, dbHost} from './services/constants';

const port = 3001;
const app = express();
const compiler = webpack(config);
const env = process.env.NODE_ENV || 'default';
let options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};

//db connection      
mongoose.connect(dbHost[env], options);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.post('/auth/register', authRoute.register);
app.post('/auth/verify', authRoute.verify);
app.post('/auth/login', authRoute.login);

//middleware for authentication
// route middleware to verify a token
app.use(function(req, res, next) {

  console.log('got into middleware');
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  console.log('token: ', token);
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, appConstants.secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }
});


app.use(require('webpack-hot-middleware')(compiler));

app.get('/api/locations', locationRoute.getLocations);
app.post('/api/location', locationRoute.addLocation);
app.post('/api/location/:id/contact', locationRoute.addContact);
app.delete('/api/location/:id/contact', locationRoute.removeContact);

app.get('/*', function(req, res) {
  res.status(500).send({ error: "No such api" });
});

app.listen(port, function(err) {
  // if (err) {
  //   console.log(err);
  // }
});

export default app;
