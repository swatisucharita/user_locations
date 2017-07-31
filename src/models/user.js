import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let userSchema = new Schema({
  phoneNumber: String,
  password: String,
  verificationCode: String,
  active: Boolean,
  settings: {
    notifyContact: Boolean,
    watchedByContact: Boolean
  }
  created_at: Date,
  updated_at: Date
});

let User = mongoose.model("User", userSchema);

export default User;
