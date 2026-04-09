/**
 * backfillSentiment.js
 *
 * One-time script to retroactively analyze sentiment for all existing reviews
 * and update professor averageSentimentScore aggregates.
 *
 * Usage: node server/scripts/backfillSentiment.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const Review = require("../models/Review");
const Professor = require("../models/Professor");
const { analyzeSentiment } = require("../utils/sentimentAnalyzer");
const { updateProfessorAggregates } = require("../utils/aggregateCalculator");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.\n");

  const reviews = await Review.find({});
  console.log(`Found ${reviews.length} reviews to process.\n`);

  let updated = 0;
  let skipped = 0;

  for (const review of reviews) {
    if (!review.reviewText || review.reviewText.trim().length === 0) {
      // No text — assign neutral and skip the API call
      review.sentimentScore = 0;
      review.sentimentLabel = "neutral";
      await review.save();
      skipped++;
      continue;
    }

    try {
      const { score, label } = await analyzeSentiment(review.reviewText);
      review.sentimentScore = score;
      review.sentimentLabel = label;
      await review.save();
      updated++;
      console.log(`  [${label.padEnd(8)}] (${score >= 0 ? "+" : ""}${score}) — "${review.reviewText.substring(0, 60)}..."`);

      // Small delay to avoid rate-limiting on the LLM API
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`  [FAILED ] Review ${review._id}:`, err.message);
    }
  }

  console.log(`\nSentiment backfill complete: ${updated} analyzed, ${skipped} skipped (no text).`);

  // Recalculate professor aggregates (includes new sentimentScore averages)
  console.log("\nRecalculating professor aggregates...");
  const professors = await Professor.find({});
  for (const prof of professors) {
    await updateProfessorAggregates(prof._id);
  }
  console.log(`Updated aggregates for ${professors.length} professors.`);

  await mongoose.disconnect();
  console.log("\nDone!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
