import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let userSchema = new Schema({
  phoneNumber: String,
  password: String,
  verificationCode: String,
  active: Boolean,
  deviceId: String,
  oneSignalId: String,
  platform: String,
  settings: {
    notifyContact: Boolean,
    watchedByContact: Boolean
  },
  created_at: Date,
  updated_at: Date
});

userSchema.pre("save", function(next){
  if (!this.created_at){
    this.created_at = (new Date()).toUTCString();
  }
  this.updated_at = (new Date()).toUTCString();
  next();
});

let User = mongoose.model("User", userSchema);

export default User;
