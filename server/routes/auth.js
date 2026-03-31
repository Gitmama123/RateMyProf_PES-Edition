const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");
const { getAllowedProfessors } = require("../services/academyService");

// POST /api/auth/pesu-login
router.post("/pesu-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Please provide both SRN and Password." });
    }

    // 1. Call the PESU-Auth REST endpoint for primary verification
    const pesuRes = await fetch("https://pesu-auth.onrender.com/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, profile: true }),
    });

    const pesuData = await pesuRes.json();

    if (!pesuRes.ok || pesuData.status === false) {
      return res.status(401).json({ success: false, error: pesuData.message || "Invalid PESU credentials." });
    }

    // 2. Fetch "All-Time" academic history (Professor Names)
    // We do this during login to verify which profs they can rate.
    const allowedProfessors = await getAllowedProfessors(username, password);

    // Success! Generate a JWT containing their SRN and academic history.
    const token = jwt.sign(
      { 
        username, 
        role: "student",
        allowedProfessors: allowedProfessors || [] // Default to empty if scraper fails
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        username,
        role: "student",
        allowedProfessors: allowedProfessors || [],
      },
      message: "Successfully verified student status and academic record.",
    });

  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ success: false, error: "External PESU-Auth API is currently down." });
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
