const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  pickupTime: { type: String, required: true },
  wasteType: { type: String, required: true },
  status: { type: String, default: "Ongoing" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
