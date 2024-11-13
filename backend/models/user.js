const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true 
  },
  fullName: { 
    type: String,
    trim: true,
    maxlength: 100
  },
  phoneNumber: { 
    type: String,
    trim: true,
    match: [/^[\d\s-+()]{10,15}$/, 'Please enter a valid phone number']
  },
  address: { 
    type: String,
    trim: true,
    maxlength: 200
  },
  city: { 
    type: String,
    trim: true,
    maxlength: 100
  },
  state: { 
    type: String,
    trim: true,
    maxlength: 50
  },
  postalCode: { 
    type: String,
    trim: true,
    match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid postal code']
  },
  residenceType: { 
    type: String,
    enum: ['House', 'Apartment', 'Condo', 'Other'],
    trim: true
  },
  numberOfResidents: { 
    type: Number,
    min: 1,
    max: 99
  },
  preferredPickupTime: { 
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
    trim: true
  },
  profileCompleted: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  lastUpdated: { 
    type: Date 
  },
  lastLogin: { 
    type: Date 
  },
  profileImage: {
    type: String,
    default: null
  }
});

// Add index for faster queries
userSchema.index({ email: 1, username: 1 });

// Pre-save middleware to update lastUpdated
userSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("User", userSchema);
