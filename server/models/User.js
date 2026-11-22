const mongoose = require('mongoose');


// example
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      }
    ],
        displayName: {
      type: String,
      maxlength: 50,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    profilePicUrl: {
      type: String,
      default: '',
    },
    ratedPosts: [
      {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post',
        },
        value: {
          type: Number,
          min: 1,
          max: 5
        },
      }
    ],
  },
);

module.exports = mongoose.model('User', userSchema);