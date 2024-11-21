const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
  try {
    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const feedback = new Feedback({
      userId: req.body.userId,
      fullName: req.body.fullName,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
    });

    const savedFeedback = await feedback.save();
    res.status(201).json({ 
      success: true,
      message: 'Feedback submitted successfully', 
      feedback: savedFeedback 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing feedback',
      error: error.message 
    });
  }
});
// Add new GET route for user feedback
router.get('/user/:userId', async (req, res) => {
  try {
    const userFeedback = await Feedback.find({ userId: req.params.userId });
    res.status(200).json(userFeedback);
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ message: 'Error fetching user feedback', error });
  }
});

module.exports = router;