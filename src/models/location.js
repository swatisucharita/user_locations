import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let locationSchema = new Schema({
  name: String,
  address: String,
  coords: {
    latitude: String,
    longitude: String
  },
  contact: {
    id: String,
    displayName: String,
    phoneNumbers: [{
      phoneType: String,
      phoneValue: String
    }],
    photos: [{
      photoType: String,
      photoValue: String
    }]
  },
  userId: String,
  created_at: Date,
  updated_at: Date
});

let Location = mongoose.model("Location", locationSchema);

export default Location;
