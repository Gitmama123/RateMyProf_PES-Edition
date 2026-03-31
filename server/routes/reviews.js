const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Professor = require("../models/Professor");
const { profanityMiddleware } = require("../middleware/profanityFilter");
const { verifyToken, isAdmin, JWT_SECRET } = require("../middleware/auth");
const { updateProfessorAggregates } = require("../utils/aggregateCalculator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { isMemberOf } = require("../utils/fuzzyMatcher");

// POST /reviews – Submit a new review
// Requires authentication and uses profanity middleware
router.post("/", verifyToken, profanityMiddleware, async (req, res) => {
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

    // Generate anonymous student hash if user is a student
    let studentHash = null;
    if (req.user.role === "student") {
      // ─── ACADEMIC VERIFICATION CHECK ───
      // (Bypassed by user request: allow all students to rate all professors)
      const professor = await Professor.findById(professorId);
      
      if (!professor) {
        return res.status(404).json({ error: "Professor not found" });
      }

      const srn = req.user.username;
      studentHash = crypto
        .createHash("sha256")
        .update(srn + professorId + JWT_SECRET)
        .digest("hex");
      
      // Check for existing review by this student for this professor
      const existing = await Review.findOne({ professorId, studentHash });
      if (existing) {
        return res.status(400).json({ error: "You have already reviewed this professor." });
      }
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
      studentHash,
    });

    await review.save();

    // ─── Recompute professor aggregates ───
    await updateProfessorAggregates(professorId);

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

    // Check if the current user can edit any of these reviews
    let enhancedReviews = reviews.map(r => r.toObject());
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded && decoded.username) {
          enhancedReviews = enhancedReviews.map(r => {
            if (r.studentHash) {
              const hash = crypto
                .createHash("sha256")
                .update(decoded.username + professorId + JWT_SECRET)
                .digest("hex");
              
              if (hash === r.studentHash) {
                return { ...r, canEdit: true };
              }
            }
            return r;
          });
        }
      } catch (e) {
        // Token invalid, ignore
      }
    }

    res.json({ reviews: enhancedReviews, breakdown, totalReviews: count });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// PUT /reviews/:id – Update an existing review
router.put("/:id", verifyToken, profanityMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, teachingQuality, difficulty, gradingStrictness, attendanceStrictness, reviewText, tags } = req.body;

    const review = await Review.findById(id).select("+studentHash");
    if (!review) return res.status(404).json({ error: "Review not found" });

    // Authorization: Must be the owner
    const hash = crypto
      .createHash("sha256")
      .update(req.user.username + review.professorId.toString() + JWT_SECRET)
      .digest("hex");

    if (hash !== review.studentHash) {
      return res.status(403).json({ error: "You are not authorized to edit this review" });
    }

    // Update fields
    review.rating = rating;
    review.teachingQuality = teachingQuality;
    review.difficulty = difficulty;
    review.gradingStrictness = gradingStrictness;
    review.attendanceStrictness = attendanceStrictness;
    review.reviewText = reviewText || "";
    review.tags = tags || [];

    await review.save();
    await updateProfessorAggregates(review.professorId);

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Failed to update review" });
  }
});

// DELETE /reviews/:id – Delete a review (Admin Only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    const professorId = review.professorId;
    await Review.findByIdAndDelete(id);

    // Update aggregates
    await updateProfessorAggregates(professorId);

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
