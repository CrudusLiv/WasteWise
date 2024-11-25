const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Middleware to check authentication
const checkAuth = async (req, res, next) => {
  const userId = req.headers.authorization;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication check failed' });
  }
};

// Protected route example
router.get('/profile', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      residenceType: user.residenceType,
      numberOfResidents: user.numberOfResidents,
      preferredPickupTime: user.preferredPickupTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;
// Add admin check middleware
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Admin check failed' });
  }
};

// Admin routes
router.get('/all', checkAuth, checkAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.patch('/:userId/status', checkAuth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: req.body.isActive },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Add route to toggle admin status
router.patch('/:userId/admin-status', checkAuth, checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isAdmin: req.body.isAdmin },
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: `Admin status ${req.body.isAdmin ? 'granted' : 'revoked'} successfully`,
      user: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin status' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});
