const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  lastLogin: { type: Date, required: true },
});

module.exports = mongoose.model("UserActivity", userActivitySchema);
