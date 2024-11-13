const mongoose = require("mongoose");

const wasteCollectionSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  wasteType: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WasteCollection", wasteCollectionSchema); 