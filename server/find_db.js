require("dotenv").config();
const { MongoClient } = require("mongodb");

async function findData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to Atlas Cluster!");
    
    // List all databases
    const dbs = await client.db().admin().listDatabases();
    console.log(`\n🔍 Found ${dbs.databases.length} databases in your cluster:`);
    
    for (let dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      if (dbName === "admin" || dbName === "local") continue; // skip system dbs
      
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      console.log(`\n📁 Database: '${dbName}'`);
      for (let coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`   - Collection '${coll.name}' has ${count} documents`);
      }
    }
    
    console.log("\nDone!");

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
}

findData();
