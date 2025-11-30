const mongoose = require("mongoose");

const questSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    enum: ["post", "food"],
    required: true,
  },
  target_count: {
    type: Number,
    required: true,
  },
  xp_reward: {
    type: Number,
    required: true,
    default: 10,
  },
  active: {
    type: Boolean,
    required: false,
    default: true,
  },
  repeatable: {
    type: String,
    required: false,
    enum: ["none", "daily", "weekly", "monthly"],
    default: "none",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Quest", questSchema);
