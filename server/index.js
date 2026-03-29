require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const professorRoutes = require("./routes/professors");
const reviewRoutes = require("./routes/reviews");
const scrapeRoutes = require("./routes/scrape");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// ─── Routes ───
app.use("/professors", professorRoutes);
app.use("/reviews", reviewRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Rate My Prof – PES Edition API is running 🚀" });
});

// ─── Database Connection ───
// Uses MongoDB Memory Server if no real MongoDB is available
async function startServer() {
  let mongoUri = process.env.MONGODB_URI;

  try {
    // Try connecting to the configured URI first
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ Connected to MongoDB");
    
    // Auto-seed if empty
    await seedDatabase();
  } catch (err) {
    console.log("⚠️  Could not connect to MongoDB, starting in-memory database...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to in-memory MongoDB");

    // Auto-seed with sample data in memory mode
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Auto Seed Logic
async function seedDatabase() {
  try {
    const User = require("./models/User");
    const adminExists = await User.findOne({ username: "ssmeduri" });
    if (!adminExists) {
      console.log("🛡️ Seeding admin account...");
      const bcrypt = require("bcryptjs");
      const hashed = await bcrypt.hash("Lallantaap@123", 10);
      await User.create({ username: "ssmeduri", password: hashed, role: "admin" });
    }

    const Professor = require("./models/Professor");
    const count = await Professor.countDocuments();
    if (count === 0) {
      console.log("📦 Professor collection is empty. Invoking scraper to seed data...");
      const { scrapeProfessors } = require("./services/scraper");
      await scrapeProfessors("https://staff.pes.edu/ec/atoz/computer-science/", "Computer Science", "EC Campus");
    }
  } catch (error) {
    console.log("⚠️ Error during auto-seeding:", error.message);
  }
}

startServer();
