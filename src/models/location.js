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
      phoneValue: String,
      phoneType: String
    }],
    photos: [{
      photoValue: String,
      photoType: String
    }]
  },
  userId: String,
  created_at: Date,
  updated_at: Date
});

locationSchema.pre("save", function(next){
  if (!this.created_at){
    this.created_at = (new Date()).toUTCString();
  }
  this.updated_at = (new Date()).toUTCString();
  next();
});

let Location = mongoose.model("Location", locationSchema);

export default Location;
