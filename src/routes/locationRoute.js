import mongoose from 'mongoose';
import Location from '../models/location';
import uuid from 'uuid/v4';

class LocationRoute {
  addLocation(req, res) {
    let userId = req.query.userId;
    let location = req.body;

    location.id = uuid();
    location.userId = userId;

    let savedLocation = new Location(location);

    savedLocation.save(function (err) {
      if (err) {
        res.status(500)
          .send('Failed to save');
      }

      return res.json(savedLocation);
    });
  }

  getLocations(req, res) {
    console.log('get locations called');
    let userId = req.query.userId;

    Location.find({ userId: userId }, function (err, locations) {
      if (err) {
        res.status(500)
          .send('Something went wrong');
      }

      console.log('locations: ', locations);
      return res.json(locations);
    });
  }

  updateLocation(req, res) {
    let locationId = req.params.id;
    let locationInfo = req.body;

    Location.findOne({ id: locationId }, function (err, location) {
      if (err) {
        res.status(500)
          .send('No Such location');
      }

      Object.keys(locationInfo).forEach(key => {
        location[key] = locationInfo[key];
      });

      location.save(function (err) {
        if (err) {
          res.status(500)
            .send('Failed to save');
        }

        return res.json(location);
      });
    });
  }

  startNavigation(req, res) {
    let locationId = req.params.id;

    Location.findOne({ id: locationId }, function (err, location) {
      if (err) {
        res.status(500)
          .send('No Such location');
      }

      // if (location.contact && location.contact.id) {
      //   console.log('notify contact'); // TO DO:
      // }
    });
  }

  addContact(req, res) {
    let locationId = req.params.id;
    let userId = req.query.userId;

    let contact = req.body.contact;
    Location.findOne({_id: locationId, userId: userId}, function (err, location) {
      if (err) {
        res.status(500)
          .send('No Such location');
      }

      location.contact = contact;

      location.save(function (err) {
        if (err) {
          return res.status(500)
            .send('Failed to save');
        }
  
        return res.json(location);
      });
    });
  }

  removeContact(req, res) {
    let locationId = req.params.id;
    let userId = req.query.userId;

    Location.findOne({_id: locationId, userId: userId}, function (err, location) {
      if (err) {
        res.status(500)
          .send('No Such location');
      }

      location.contact = {};

      location.save(function (err) {
        if (err) {
          return res.status(500)
            .send('Failed to save');
        }
  
        return res.json({ success: true });
      });
    });
  }

}

let locationRoute = new LocationRoute();
export default locationRoute;

