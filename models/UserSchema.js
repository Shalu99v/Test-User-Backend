const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          return /\.(jpg|jpeg|png|gif)$/i.test(v);
        },
        message: 'Only image files (jpg, jpeg, png, gif) are allowed',
      },
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); 
        },
        message: 'Phone number must be exactly 10 digits',
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
