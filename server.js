const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const User = require("./backend/models/user");
const Report = require("./backend/models/report");
const UserActivity = require("./backend/models/user-activity");
const Notification = require("./backend/models/notification");
const reportRoutes = require("./backend/routes/report");
const wasteCollectionRoutes = require('./backend/routes/wasteCollection');
const WasteCollection = require('./backend/models/wasteCollection');
const feedbackRoutes = require('./backend/routes/feedback')

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Existing middleware
app.use(cors());
app.use(bodyParser.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://CrudusLiv:pNqd4eHjHkWkMNND@cluster0.n2yin.mongodb.net/WasteWise?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connected to WasteWise database");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
// Route for Signup (POST)
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const malaysiaTime = new Date(Date.now() + 8 * 60 * 60 * 1000);

    const newUser = new User({
      username,
      email,
      password,
      createdAt: malaysiaTime,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during signup:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Username or email already exists." });
    } else {
      res.status(500).json({ message: "Signup failed", error: error.message });
    }
  }
});

// Route for Login (POST)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Authentication failed!" });
    }

    const malaysiaTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    user.lastLogin = malaysiaTime;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      username: user.username,  // Add this line
      lastLogin: user.lastLogin,
      profileCompleted: user.profileCompleted
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

// Route for checking email (GET)
app.get("/api/check-email", async (req, res) => {
  const email = req.query.email;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.json(true);
    }
    return res.json(false);
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route for checking username (GET)
app.get("/api/check-username", async (req, res) => {
  const username = req.query.username;

  try {
    const user = await User.findOne({ username });
    res.json(!!user); // Returns true if user exists, false if not
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for getting user data (GET)
app.get("/api/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data", error });
  }
});

// Route for updating user data (PUT)
app.put("/api/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = {
      ...req.body,
      lastUpdated: new Date(Date.now() + 8 * 60 * 60 * 1000),
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "User updated successfully!", 
      user: updatedUser 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({
        message: "This email is already registered. Please use a different email.",
      });
    } else {
      console.error("Error updating user data:", error);
      res.status(500).json({ 
        message: "Error updating user data", 
        error: error.message 
      });
    }
  }
});

app.get("/api/user", async (req, res) => {
  const email = req.query.email;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data by email:", error);
    res.status(500).json({ message: "Error fetching user data", error });
  }
});

// Route for getting user activity for the last 7 days (GET)
app.get("/api/user-activity", async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const activities = await UserActivity.find({
      lastLogin: { $gte: sevenDaysAgo },
    }).sort({ lastLogin: -1 });

    // Adjust lastLogin time to remove 8-hour offset
    const adjustedActivities = activities.map((activity) => ({
      username: activity.username,
      email: activity.email,
      lastLogin: new Date(activity.lastLogin.getTime() - 8 * 60 * 60 * 1000), // Remove 8 hours
    }));

    res.status(200).json(adjustedActivities);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ message: "Error fetching user activity", error });
  }
});


// Route to create a new report
app.post("/api/report", upload.single("photo"), async (req, res) => {
  try {
    const { issueType, location, description } = req.body;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const newReport = new Report({
      issueType,
      location,
      description,
      photo: req.file ? req.file.path : null,
      userId,
    });

    await newReport.save(); // Save to DB
    res
      .status(201)
      .json({ message: "Report has been successfully submitted!" });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route for fetching reported issues
app.get("/api/report-issues", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const issues = await Report.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: "$issueType",
          count: { $sum: 1 },
        },
      },
    ]);

    const reportCounts = {
      "Missed Pickup": 0,
      "Overflowing Bin": 0,
      "Illegal Dumping": 0,
      Other: 0,
    };

    issues.forEach((issue) => {
      if (reportCounts[issue._id] !== undefined) {
        reportCounts[issue._id] = issue.count;
      } else {
        reportCounts["Other"] += issue.count;
      }
    });

    res.status(200).json(reportCounts);
  } catch (error) {
    console.error("Error fetching report issues:", error);
    res.status(500).json({ message: "Error fetching report issues", error });
  }
});

// Route for fetching all reported issues sorted by creation time
app.get("/api/report-issues/all", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }); // Sort by createdAt, descending
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching report issues:", error);
    res.status(500).json({ message: "Error fetching report issues", error });
  }
});

// Route for fetching pickup statistics
app.get("/api/pickup-statistics", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const totalPickups = await Schedule.countDocuments({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const successfulPickups = await Schedule.countDocuments({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: "Completed",
    });

    const missedPickups = totalPickups - successfulPickups;

    res.status(200).json({
      totalPickups,
      successfulPickups,
      missedPickups,
    });
  } catch (error) {
    console.error("Error fetching pickup statistics:", error);
    res
      .status(500)
      .json({ message: "Error fetching pickup statistics", error });
  }
});

// Update notification endpoints
app.post("/api/notifications", async (req, res) => {
  try {
    const { title, message, userId } = req.body;
    
    if (!title || !message || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = new Notification({
      title,
      message,
      userId,
      status: 'unread'
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: "Error creating notification" });
  }
});
app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'username');
      
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

app.patch("/api/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: "Error updating notification" });
  }
});

// Update the user schema to include profile fields
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    fullName: String,
    phoneNumber: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    residenceType: String,
    numberOfResidents: Number,
    preferredPickupTime: String
  },
  profileCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date },
  lastLogin: { type: Date }
});

// Update profile route
app.put("/api/user/:id/profile", async (req, res) => {
  try {
    const userId = req.params.id;
    const profileData = req.body;
    
    console.log('Updating profile for user:', userId);
    console.log('Profile data:', profileData);

    // Check if username is already taken
    if (profileData.username) {
      const existingUser = await User.findOne({ 
        username: profileData.username,
        _id: { $ne: userId } // Exclude current user from check
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: "Username already taken",
          errors: {
            username: {
              message: "This username is already taken"
            }
          }
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: {
          fullName: profileData.fullName,
          username: profileData.username,  // Add username field
          phoneNumber: profileData.phoneNumber,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          postalCode: profileData.postalCode,
          residenceType: profileData.residenceType,
          numberOfResidents: profileData.numberOfResidents,
          preferredPickupTime: profileData.preferredPickupTime,
          profileCompleted: true,
          lastUpdated: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Profile updated successfully:', updatedUser);

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        postalCode: updatedUser.postalCode,
        residenceType: updatedUser.residenceType,
        numberOfResidents: updatedUser.numberOfResidents,
        preferredPickupTime: updatedUser.preferredPickupTime,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: "Error updating profile",
      errors: error.errors
    });
  }
});

// Get profile route
app.get("/api/user/:id/profile", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      postalCode: user.postalCode || '',
      residenceType: user.residenceType || '',
      numberOfResidents: user.numberOfResidents || 0,
      preferredPickupTime: user.preferredPickupTime || '',
      email: user.email
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
});

//Waste Collection Route
app.post('/waste-collection', (req, res) => {
  try {
    // Extract waste collection data from request body
    const { 
      wasteType, 
      quantity, 
      pickupDate, 
      userId 
    } = req.body;

    // Validate input
    if (!wasteType || !quantity || !pickupDate || !userId) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    // Here you would typically save to database
    // For now, just send a success response
    res.status(201).json({
      message: 'Waste collection scheduled successfully',
      data: {
        wasteType,
        quantity,
        pickupDate,
        userId
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error scheduling waste collection', 
      error: error.message 
    });
  }
});

app.use("/api/reports", reportRoutes);
app.use("/api/waste-collection", wasteCollectionRoutes);
app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Move this near the top with other route imports
const userRoutes = require('./backend/routes/users');

// Add admin check middleware
app.use((req, res, next) => {
  if (req.path.includes('/admin') && !req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// Move this line after all middleware declarations but before starting the server
app.use('/api/users', userRoutes);



// Add these routes after other existing routes
app.post('/api/notifications', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('adminId', 'username');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

app.patch('/api/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});


// Create a separate route specifically for marking all as read
app.patch("/api/notifications-mark-all-read", async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { status: 'unread' },
      { $set: { status: 'read' } }
    );
    
    res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});
// Delete all notifications
app.delete("/api/notifications", async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notifications' });
  }
});

// Delete single notification
app.delete("/api/notifications/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// Add this route to handle feedback responses
app.post('/api/feedback/:id/respond', async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const { response } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { $set: { response: { response } } },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error updating feedback response' });
  }
});
