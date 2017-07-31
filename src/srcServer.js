import express from 'express';
import bodyParser from 'body-parser';
import webpack from 'webpack';
import path from 'path';
import config from '../webpack.config.dev';
import authRoute from './routes/authRoute';
import locationRoute from './routes/locationRoute';

const port = 3000;
const app = express();
const compiler = webpack(config);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.post('/auth/register', authRoute.register);
app.post('/auth/verify', authRoute.verify);
app.post('/auth/login', authRoute.login);

app.get('/api/locations', locationRoute.getLocations);
app.post('/api/location', locationRoute.addLocation);

app.get('/*', function(req, res) {
  res.status(500).send({ error: "No such api" });
});

app.listen(port, function(err) {
  if (err) {
    console.log(err);
  }
});

module.exports = {};
