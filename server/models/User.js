const mongoose = require("mongoose");

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
  addedUrls: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tracks",
    },
  ],
});

module.exports = mongoose.model("Users", userSchema);
