const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Professor = require("../models/Professor");
const { profanityMiddleware } = require("../middleware/profanityFilter");

// POST /reviews – Submit a new review
// Uses profanity middleware to reject abusive content
router.post("/", profanityMiddleware, async (req, res) => {
  try {
    const {
      professorId,
      rating,
      teachingQuality,
      difficulty,
      gradingStrictness,
      attendanceStrictness,
      reviewText,
      tags,
    } = req.body;

    // Validate required fields
    if (!professorId || !rating || !teachingQuality || !difficulty || !gradingStrictness || !attendanceStrictness) {
      return res.status(400).json({ error: "All rating fields are required" });
    }

    // Check professor exists
    const professor = await Professor.findById(professorId);
    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }

    // Validate rating ranges (1–5)
    const ratings = [rating, teachingQuality, difficulty, gradingStrictness, attendanceStrictness];
    for (const r of ratings) {
      if (r < 1 || r > 5) {
        return res.status(400).json({ error: "All ratings must be between 1 and 5" });
      }
    }

    // Validate review text length
    if (reviewText && reviewText.length > 300) {
      return res.status(400).json({ error: "Review text cannot exceed 300 characters" });
    }

    // Create the review
    const review = new Review({
      professorId,
      rating,
      teachingQuality,
      difficulty,
      gradingStrictness,
      attendanceStrictness,
      reviewText: reviewText || "",
      tags: tags || [],
    });

    await review.save();

    // ─── Recompute professor aggregates ───
    const allReviews = await Review.find({ professorId });
    const count = allReviews.length;

    const sum = (field) => allReviews.reduce((acc, r) => acc + r[field], 0);

    professor.totalReviews = count;
    professor.averageRating = parseFloat((sum("rating") / count).toFixed(2));
    professor.averageTeachingQuality = parseFloat((sum("teachingQuality") / count).toFixed(2));
    professor.averageDifficulty = parseFloat((sum("difficulty") / count).toFixed(2));
    professor.averageGradingStrictness = parseFloat((sum("gradingStrictness") / count).toFixed(2));
    professor.averageAttendanceStrictness = parseFloat((sum("attendanceStrictness") / count).toFixed(2));

    await professor.save();

    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// GET /reviews/:professorId – Get all reviews for a professor
// Also returns aggregate breakdown
router.get("/:professorId", async (req, res) => {
  try {
    const { professorId } = req.params;

    const reviews = await Review.find({ professorId }).sort({ createdAt: -1 });

    // Compute breakdown averages
    const count = reviews.length;
    let breakdown = null;

    if (count > 0) {
      const sum = (field) => reviews.reduce((acc, r) => acc + r[field], 0);
      breakdown = {
        overall: parseFloat((sum("rating") / count).toFixed(2)),
        teachingQuality: parseFloat((sum("teachingQuality") / count).toFixed(2)),
        difficulty: parseFloat((sum("difficulty") / count).toFixed(2)),
        gradingStrictness: parseFloat((sum("gradingStrictness") / count).toFixed(2)),
        attendanceStrictness: parseFloat((sum("attendanceStrictness") / count).toFixed(2)),
      };
    }

    res.json({ reviews, breakdown, totalReviews: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

module.exports = router;
