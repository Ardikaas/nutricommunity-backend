const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
  first: {
    type: String,
    required: true,
  },
  second: {
    type: String,
    required: true,
  },
  third: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    default: "image.jpg",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Article", articleSchema);
