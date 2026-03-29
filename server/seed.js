/**
 * Seed script – populates the database with sample professors.
 * Run: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Professor = require("./models/Professor");

const professors = [
  {
    name: "Dr. Ramesh Kumar",
    department: "Computer Science & Engineering",
    subjects: ["Data Structures", "Algorithms", "Operating Systems"],
  },
  {
    name: "Dr. Priya Sharma",
    department: "Computer Science & Engineering",
    subjects: ["Database Management", "Software Engineering", "Web Technologies"],
  },
  {
    name: "Dr. Suresh Reddy",
    department: "Electronics & Communication",
    subjects: ["Digital Electronics", "VLSI Design", "Signal Processing"],
  },
  {
    name: "Dr. Anita Desai",
    department: "Mechanical Engineering",
    subjects: ["Thermodynamics", "Fluid Mechanics", "Machine Design"],
  },
  {
    name: "Dr. Vikram Patel",
    department: "Computer Science & Engineering",
    subjects: ["Machine Learning", "Artificial Intelligence", "Deep Learning"],
  },
  {
    name: "Dr. Meena Iyer",
    department: "Electronics & Communication",
    subjects: ["Embedded Systems", "Microcontrollers", "IoT"],
  },
  {
    name: "Dr. Arjun Nair",
    department: "Computer Science & Engineering",
    subjects: ["Computer Networks", "Cybersecurity", "Cloud Computing"],
  },
  {
    name: "Dr. Kavitha Rao",
    department: "Information Science",
    subjects: ["Data Mining", "Big Data Analytics", "Information Retrieval"],
  },
  {
    name: "Dr. Sanjay Gupta",
    department: "Electrical Engineering",
    subjects: ["Power Systems", "Control Systems", "Renewable Energy"],
  },
  {
    name: "Dr. Lakshmi Venkatesh",
    department: "Computer Science & Engineering",
    subjects: ["Compiler Design", "Theory of Computation", "Formal Languages"],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing professors
    await Professor.deleteMany({});
    console.log("🗑️  Cleared existing professors");

    // Insert sample data
    await Professor.insertMany(professors);
    console.log(`✅ Seeded ${professors.length} professors`);

    await mongoose.disconnect();
    console.log("📦 Done! Database seeded successfully.");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
