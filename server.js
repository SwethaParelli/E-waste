/*const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/ewaste')
  .then(() => console.log('✅ Connected to MongoDB (Local)'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Serve index.html on root GET
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Add all your other routes here (register, pickup, etc.) ---

// --- Schemas ---
const userSchema = new mongoose.Schema({
    name: String,
  email: String,
  phone: String,
  password: String,
  userId: String,
});

const pickupSchema = new mongoose.Schema({
  userId: String,
  name: String,        // 👈 Add this
  phone: String, 
  location: String,
  itemType: [String],
  preferredTime: String,
});

const User = mongoose.model('User', userSchema);
const Pickup = mongoose.model('Pickup', pickupSchema);

// --- Utils ---
function generateUserId() {
  return 'USER-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// --- Routes ---
// Register/Login
app.post('/api/register-login', async (req, res) => {
  const { name,email, phone, password } = req.body;
  if (!email || !phone || !password) return res.status(400).json({ message: 'All fields are required.' });
  if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: 'Phone number must be 10 digits.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.password === password) {
      return res.status(200).json({ message: `Login successful! Your User ID is ${existingUser.userId}` });
    } else {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
  }

  const userId = generateUserId();
  const newUser = new User({ name, email, phone, password, userId });

  await newUser.save();
  res.status(201).json({ message: `Registered successfully! Your User ID is ${userId}` });
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  await User.deleteOne({ email });
  res.status(200).json({ message: 'Your account has been reset. Please register again.' });
});

// Schedule Pickup
app.post('/schedule-pickup', async (req, res) => {
  const { userId, name, phone, location, itemType, preferredTime } = req.body;

  console.log("📍 Received location:", location);

  const user = await User.findOne({ userId });
  if (!user) return res.status(400).json({ message: 'Invalid user ID. Please register first.' });

  // FIXED: handle null, undefined, numbers, empty strings
  if (!location || typeof location !== 'string') {
      return res.status(400).json({ message: 'Location must be a non-empty string.' });
  }

  const locationLower = location.toLowerCase();
  if (!locationLower.includes('hyderabad')) {
      return res.status(400).json({ message: 'Service only available in Hyderabad.' });
  }

  const date = new Date(preferredTime);
  const now = new Date();
  if (isNaN(date.getTime()) || date <= now) {
      return res.status(400).json({ message: 'Pickup must be scheduled for a future time.' });
  }

  const hours = date.getHours();
  if (hours < 9 || hours > 19) {
      return res.status(400).json({ message: 'Pickup time must be between 9AM and 7PM.' });
  }

  const newPickup = new Pickup({ userId, name, phone, location, itemType, preferredTime });
  await newPickup.save();

  res.status(201).json({ message: 'Pickup scheduled successfully!' });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});*/






const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection with Proper Ordering
async function connectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ewaste');
        console.log(`[${new Date().toISOString()}] ✅ Connected to MongoDB`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ MongoDB connection error:`, error);
        process.exit(1);
    }
}

connectDB();

// --- Define MongoDB Schemas ---
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    userId: String,
});

const pickupSchema = new mongoose.Schema({
    userId: String,
    name: String,
    phone: String,
    location: String,
    itemType: [String],
    preferredTime: String,
});

const User = mongoose.model('User', userSchema);
const Pickup = mongoose.model('Pickup', pickupSchema);

// Utility function to generate User IDs
function generateUserId() {
    return 'USER-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// --- Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register/Login
app.post('/api/register-login', async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!email || !phone || !password) return res.status(400).json({ message: 'All fields are required.' });

    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: 'Phone number must be 10 digits.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        if (existingUser.password === password) {
            console.log(`[${new Date().toISOString()}] 🔑 Login successful for ${existingUser.name}`);
            return res.status(200).json({ message: `Login successful! Your User ID is ${existingUser.userId}` });
        } else {
            console.log(`[${new Date().toISOString()}] ❌ Incorrect password for ${email}`);
            return res.status(401).json({ message: 'Incorrect password.' });
        }
    }

    const userId = generateUserId();
    const newUser = new User({ name, email, phone, password, userId });

    await newUser.save();
    console.log(`[${new Date().toISOString()}] ✅ New user registered: ${name} (User ID: ${userId})`);
    res.status(201).json({ message: `Registered successfully! Your User ID is ${userId}` });
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    await User.deleteOne({ email });

    console.log(`[${new Date().toISOString()}] 🔄 User deleted: ${email}`);
    res.status(200).json({ message: 'Your account has been reset. Please register again.' });
});

// Schedule Pickup
app.post('/schedule-pickup', async (req, res) => {
    const { userId, name, phone, location, itemType, preferredTime } = req.body;

    console.log(`[${new Date().toISOString()}] 📍 Received Pickup Request from ${name}`);

    const user = await User.findOne({ userId });
    if (!user) {
        console.log(`[${new Date().toISOString()}] ❌ Invalid User ID: ${userId}`);
        return res.status(400).json({ message: 'Invalid user ID. Please register first.' });
    }

    if (!location || typeof location !== 'string') {
        return res.status(400).json({ message: 'Location must be a non-empty string.' });
    }

    const locationLower = location.toLowerCase();
    if (!locationLower.includes('hyderabad')) {
        console.log(`[${new Date().toISOString()}] ❌ Location error: ${location}`);
        return res.status(400).json({ message: 'Service only available in Hyderabad.' });
    }

    const date = new Date(preferredTime);
    const now = new Date();
    if (isNaN(date.getTime()) || date <= now) {
        console.log(`[${new Date().toISOString()}] ❌ Invalid pickup time: ${preferredTime}`);
        return res.status(400).json({ message: 'Pickup must be scheduled for a future time.' });
    }

    const hours = date.getHours();
    if (hours < 9 || hours > 19) {
        return res.status(400).json({ message: 'Pickup time must be between 9AM and 7PM.' });
    }

    const newPickup = new Pickup({ userId, name, phone, location, itemType, preferredTime });
    await newPickup.save();

    console.log(`[${new Date().toISOString()}] ✅ Pickup scheduled for ${name} at ${location}`);
    res.status(201).json({ message: 'Pickup scheduled successfully!' });
});

// Start Server with Ordered Logs
app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] 🚀 Server running on http://localhost:${PORT}`);
});

