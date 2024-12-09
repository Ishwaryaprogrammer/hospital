
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./models/User'); // User model file


const app = express();
const port = 5000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: '0000',  // Secret key for session
  resave: false,
  saveUninitialized: true
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/medtech', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});

// Serve the index.html file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public',  'index.html'));  // Ensure the correct path is provided to the HTML file
});

// Serve static files like CSS, JS, images
app.use(express.static(__dirname));

// Routes
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send("User already exists");
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send("User registered successfully");

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Server error");
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found");
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    // Set session data for login
    req.session.userId = user._id;

    res.status(200).send("Login successful");

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

// Endpoint to fetch user profile data
app.get('/userprofile', async (req, res) => {
  try {
    // Ensure the user is logged in
    if (!req.session.userId) {
      return res.status(401).send("Unauthorized");
    }

    // Fetch user data from the database
    const user = await User.findById(req.session.userId).select('username email');
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Send user data as JSON
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Server error");
  }
});



// Medicine Schema
const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dose: { type: String, required: true },
  type: { type: String, required: true },
  days: { type: String, required: true },
  times: { type: [String], required: true },
});

// Medicine Model
const Medicine = mongoose.model('Medicine', medicineSchema);

// API Routes

// Get all medicines
app.get('/api/medicines', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add a new medicine
app.post('/api/medicines', async (req, res) => {
  try {
    const newMedicine = new Medicine(req.body);
    await newMedicine.save();
    res.json(newMedicine);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get medicine by ID
app.get('/api/medicines/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (medicine) {
      res.json(medicine);
    } else {
      res.status(404).send("Medicine not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update a medicine by ID
app.put('/api/medicines/:id', async (req, res) => {
  try {
    const updatedMedicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedMedicine) {
      res.json(updatedMedicine);
    } else {
      res.status(404).send("Medicine not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete a medicine by ID
app.delete('/api/medicines/:id', async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);
    if (deletedMedicine) {
      res.json({ message: 'Medicine deleted successfully' });
    } else {
      res.status(404).send("Medicine not found");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

