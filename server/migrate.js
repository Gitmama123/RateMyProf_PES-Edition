require("dotenv").config();
const mongoose = require("mongoose");
const Professor = require("./models/Professor");
const Review = require("./models/Review");
const User = require("./models/User");

// Hardcoded to your local database that has the 374 professors
const LOCAL_URI = "mongodb://localhost:27017/ratemyprof_pes";
// Pulls your cloud database URL from your .env file
const ATLAS_URI = process.env.MONGODB_URI;

async function migrateData() {
  if (!ATLAS_URI || ATLAS_URI.includes("localhost")) {
    console.error("❌ ERROR: MONGODB_URI in server/.env must be your Atlas connection string (mongodb+srv://...)!");
    process.exit(1);
  }

  try {
    console.log("🚀 Connecting to LOCAL database...");
    const localDb = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log("✅ Connected to LOCAL database.");

    console.log("🚀 Connecting to ATLAS cloud database...");
    const atlasDb = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log("✅ Connected to ATLAS cloud database.");

    // Models mapped to Local DB
    const LocalProfessor = localDb.model("Professor", Professor.schema);
    const LocalReview = localDb.model("Review", Review.schema);
    const LocalUser = localDb.model("User", User.schema);

    // Models mapped to Atlas DB
    const AtlasProfessor = atlasDb.model("Professor", Professor.schema);
    const AtlasReview = atlasDb.model("Review", Review.schema);
    const AtlasUser = atlasDb.model("User", User.schema);

    // 1. Migrate Professors
    console.log("\n📦 Fetching Local Professors...");
    const localProfessors = await LocalProfessor.find({}).lean();
    console.log(`Found ${localProfessors.length} professors. Pushing to Cloud...`);
    await AtlasProfessor.deleteMany({}); // Clear fresh duplicates seeded by auto-scraper
    if (localProfessors.length > 0) await AtlasProfessor.insertMany(localProfessors);
    
    // 2. Migrate Reviews
    console.log("\n📦 Fetching Local Reviews...");
    const localReviews = await LocalReview.find({}).lean();
    console.log(`Found ${localReviews.length} reviews. Pushing to Cloud...`);
    await AtlasReview.deleteMany({});
    if (localReviews.length > 0) await AtlasReview.insertMany(localReviews);

    // 3. Migrate Users
    console.log("\n📦 Fetching Local Users...");
    const localUsers = await LocalUser.find({}).lean();
    console.log(`Found ${localUsers.length} users. Pushing to Cloud...`);
    await AtlasUser.deleteMany({});
    if (localUsers.length > 0) await AtlasUser.insertMany(localUsers);

    console.log("\n🎉 MIGRATION COMPLETE! All your professors and reviews have been pushed to MongoDB Atlas!");

    await localDb.close();
    await atlasDb.close();
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrateData();
