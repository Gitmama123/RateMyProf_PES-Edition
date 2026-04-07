require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const professorRoutes = require("./routes/professors");
const reviewRoutes = require("./routes/reviews");
const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// ─── Routes ───
app.use("/professors", professorRoutes);
app.use("/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

// Health check / Diagnostic endpoint
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  const dbName = mongoose.connection.name || "None";
  
  try {
    const Professor = require("./models/Professor");
    const count = await Professor.countDocuments();
    res.json({ 
      status: "Online", 
      database: dbStatus, 
      dbName: dbName,
      professorCount: count,
      environment: process.env.NODE_ENV || "development"
    });
  } catch (err) {
    res.status(500).json({ status: "Error", error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Rate My Prof – PES Edition API is running 🚀" });
});

// ─── Database Connection ───
// Uses MongoDB Memory Server if no real MongoDB is available
async function startServer() {
  let mongoUri = process.env.MONGODB_URI;

  try {
    const timeout = process.env.NODE_ENV === 'production' ? 20000 : 3000;
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: timeout });
    console.log("Connected to MongoDB Atlas.");
    await seedDatabase();
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.error("FATAL: Could not connect to MongoDB Atlas in production.");
      console.error("Error:", err.message);
      process.exit(1);
    }

    console.warn("Could not connect to MongoDB. Starting with in-memory database...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log("Connected to in-memory MongoDB.");
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
  });
}

async function seedDatabase() {
  try {
    const User = require("./models/User");
    const adminExists = await User.findOne({ username: "ssmeduri" });
    if (!adminExists) {
      console.log("Seeding admin account...");
      const bcrypt = require("bcryptjs");
      const hashed = await bcrypt.hash("Lallantaap@123", 10);
      await User.create({ username: "ssmeduri", password: hashed, role: "admin" });
    }

    const Professor = require("./models/Professor");
    const count = await Professor.countDocuments();
    if (count === 0) {
      console.log("Professor collection is empty. Running initial scrape...");
      const { scrapeProfessors } = require("./services/scraper");
      await scrapeProfessors("https://staff.pes.edu/ec/atoz/computer-science/", "Computer Science", "EC Campus");
    }
  } catch (error) {
    console.warn("Error during auto-seeding:", error.message);
  }
}

startServer();
