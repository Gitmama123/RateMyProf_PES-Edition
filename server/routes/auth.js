const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");

// Utility to generate Reddit-style random username
const generateRandomId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `User_${result}`;
};

// POST /api/auth/signup - Only requires password for standard users
router.post("/signup", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
    }

    // Generate a unique username
    let uniqueUsername = generateRandomId();
    let isUnique = false;
    while (!isUnique) {
      const existingUser = await User.findOne({ username: uniqueUsername });
      if (!existingUser) {
        isUnique = true;
      } else {
        uniqueUsername = generateRandomId(); // Regenerate if collision exists
      }
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: uniqueUsername,
      password: hashedPassword,
      role: "user",
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        username: newUser.username,
        role: newUser.role,
      },
      message: `Your anonymous generated ID is: ${newUser.username}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create account" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Please provide both username and password" });
    }

    // Attempt to locate user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Check pass hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Sign a fresh token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error during login" });
  }
});

module.exports = router;
