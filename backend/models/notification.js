const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, default: 'feedback' }
});

module.exports = mongoose.model("Notification", notificationSchema);