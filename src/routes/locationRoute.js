import mongoose from 'mongoose';
import Location from '../models/location';
import uuid from 'uuid/v4';

const mongoUrl = 'mongodb://localhost:27017/user-locations-dev';

exports.addLocation = function(req, res){
  mongoose.connect(mongoUrl);

  console.log('phoneNumber: ', req.query);
  let userId = req.query.userId;
  let location = req.body;

  location.id = uuid();
  location.userId = userId;

  let savedLocation = new Location(location);

  savedLocation.save(function(err) {
    if (err) {
      console.log('Error in saving: ', err);
      res.status(500)
        .send('Failed to save');
    };

    return res.json(savedLocation);
  });
};

exports.getLocations = function(req, res){
  mongoose.connect(mongoUrl);
  let userId = req.query.userId;

  Location.find({userId: userId}, function(err, locations){
    if (err) {
      res.status(500)
        .send('Something went wrong');
    };

    return res.json(locations);
  });
};

exports.updateLocation = function(req, res){
  mongoose.connect(mongoUrl);

  let locationId = req.params.id;
  let locationInfo = req.body;

  Location.findOne({id: locationId}, function(err, location){
    if (err) {
      res.status(500)
        .send('No Such location');
    };

    Object.keys(locationInfo).forEach(key => {
      location[key] = locationInfo[key];
    })

    location.save(function(err) {
      if (err) {
        console.log('Error in saving: ', err);
        res.status(500)
          .send('Failed to save');
      };

      return res.json(location);
    })
  });
};

exports.startNavigation = function(req, res){
  mongoose.connect(mongoUrl);

  let locationId = req.params.id;

  Location.findOne({id: locationId}, function(err, location){
    if (err) {
      res.status(500)
        .send('No Such location');
    };

    if (location.contact && location.contact.id){
      
    }
  });
};
