const express = require("express");
const router = express.Router();
const Report = require("../models/report");

// Get all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports" });
  }
});

module.exports = router; 