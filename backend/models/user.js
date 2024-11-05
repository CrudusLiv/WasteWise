const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String, required: false },
  address: { type: String, required: false },
  communityName: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  lastUpdated: { type: Date },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
