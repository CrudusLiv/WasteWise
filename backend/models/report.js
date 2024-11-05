const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  issueType: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
