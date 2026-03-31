const mongoose = require("mongoose");
const LOCAL_URI = "mongodb://localhost:27017/ratemyprof_pes";

async function checkLocal() {
  try {
    console.log("Connecting to Local MongoDB...");
    const localDb = await mongoose.createConnection(LOCAL_URI).asPromise();
    
    const ProfessorLocal = localDb.collection("professors");
    const profCount = await ProfessorLocal.countDocuments();
    
    const ReviewLocal = localDb.collection("reviews");
    const revCount = await ReviewLocal.countDocuments();
    
    console.log(`✅ SUCCESS! Local Database contains ${profCount} professors and ${revCount} reviews.`);
    
    if (profCount > 0) {
      console.log("You can safely run `node migrate.js` to push these straight up to Atlas!");
    } else {
      console.log("Unfortunately, your local database doesn't have the 374 professors. You'll need to use your Admin Scraper panel to re-download them!");
    }
    
    await localDb.close();
  } catch (err) {
    console.error("❌ ERROR: Could not connect to your Local MongoDB. Is MongoDB Community Server running on your PC?", err.message);
  }
}

checkLocal();
