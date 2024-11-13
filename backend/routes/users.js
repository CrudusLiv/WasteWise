const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      address: user.address,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});
