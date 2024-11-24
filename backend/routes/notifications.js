const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

router.post('/', async (req, res) => {
  try {
    const notification = new Notification({
      title: req.body.title,
      message: req.body.message,
      userId: req.body.userId,
      type: req.body.type || 'feedback'
    });
    
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;