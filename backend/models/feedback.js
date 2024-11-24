const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  subject: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now },
  response: {
    response: String,
    respondedAt: { type: Date }
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);