const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  phoneNumber:{
    type: Number,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;
