const express = require("express");
const router = express.Router();
const Report = require("../models/report");

// Add this new route handler
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const reports = await Report.find({ userId: userId });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user reports" });
  }
});

// Keep existing routes
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports" });
  }
});

router.get("/feedback", async (req, res) => {
  try {
    const feedbackReports = await Report.find({ type: 'feedback' });
    res.json(feedbackReports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback reports" });
  }
});

router.get("/pickup", async (req, res) => {
  try {
    const pickupReports = await Report.find({ type: 'pickup' });
    res.json(pickupReports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pickup reports" });
  }
});

module.exports = router;