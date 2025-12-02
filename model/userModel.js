const mongoose = require("mongoose");

const rankSchema = mongoose.Schema({
  highest: {
    type: Number,
    required: false,
    default: 0,
  },
  current: {
    type: Number,
    required: false,
    default: 0,
  },
});

const badgeSchema = mongoose.Schema({
  badgeid: {
    type: String,
    required: false,
  },
  get_on: {
    type: Date,
    required: false,
  },
});

const postSchema = mongoose.Schema({
  postid: {
    type: String,
    required: false,
  },
  post_like: {
    type: Number,
    required: false,
  },
  posted_at: {
    type: Date,
    required: false,
  },
});

const questSchema = mongoose.Schema({
  quest_id: {
    type: String,
    required: true,
  },
  exp_earned: {
    type: Number,
    required: true,
  },
  completed_at: {
    type: Date,
    required: true,
  },
});

const streakSchema = mongoose.Schema({
  last_completed: {
    type: Date,
    required: false,
  },
  current_streak: {
    type: Number,
    default: 0,
  },
});

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
      default: "user",
    },
    avatar: {
      type: String,
      required: false,
      default: "default_avatar.png",
    },
    exp: {
      type: Number,
      required: true,
      default: 0,
    },
    streak: streakSchema,
    rank: [rankSchema],
    badge: [badgeSchema],
    quest: [questSchema],
    post: [postSchema],
  },
  {
    timeStamp: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
