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
    required: true,
  },
  completed_at: {
    type: Date,
    required: true,
  },
});

const userSchema = mongoose.Schema(
  {
    name: {
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
      default: "defaultava.png",
    },
    exp: {
      type: Number,
      required: true,
      default: 0,
    },
    rank: [rankSchema],
    badge: [badgeSchema],
    mission: [missionSchema],
  },
  {
    timeStamp: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
