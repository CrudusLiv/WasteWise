const express = require('express');
const router = express.Router();
const WasteCollection = require('../models/wasteCollection');

// Get waste collection entries for a specific user
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query parameters
    const query = userId ? { userId } : {}; // If userId is provided, filter by userId
    const collections = await WasteCollection.find(query).sort({ date: -1 }); // Sort by date
    res.status(200).json(collections);
  } catch (error) {
    console.error("Error fetching waste collections:", error);
    res.status(500).json({ message: "Error fetching waste collections", error: error.message });
  }
});

// Generate schedule report for a specific user
router.get("/generate-report", async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query parameters
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const schedules = await WasteCollection.find({ userId }).sort({ date: -1 });
    // Here you can format the schedules into a report as needed
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error generating schedule report:", error);
    res.status(500).json({ message: "Error generating schedule report", error: error.message });
  }
});

router.post('/schedule', async (req, res) => {
  try {
    const { userId, area, date, wasteType, notes } = req.body;
    
    const collection = new WasteCollection({
      userId,
      area,
      date,
      wasteType,
      notes
    });
    
    const savedCollection = await collection.save();
    res.status(201).json({
      success: true,
      data: savedCollection
    });
  } catch (error) {
    console.log('Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule collection',
      error: error.message
    });
  }
});
module.exports = router;

// Add this new route to handle status updates
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedCollection = await WasteCollection.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json(updatedCollection);
  } catch (error) {
    console.error("Error updating collection status:", error);
    res.status(500).json({ message: "Error updating collection status", error: error.message });
  }
});
