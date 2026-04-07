const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Review = require("../models/Review");
const Professor = require("../models/Professor");
const User = require("../models/User");
const { checkProfanity } = require("../middleware/profanityMiddleware");
const { verifyToken, isAdmin, JWT_SECRET } = require("../middleware/auth");
const { updateProfessorAggregates } = require("../utils/aggregateCalculator");
const { applyReward } = require("../services/trustService");
const { isMemberOf } = require("../utils/fuzzyMatcher");

/**
 * Compute the anonymous student hash for a given SRN + professorId.
 * Used for duplicate prevention and ownership checks.
 */
function computeStudentHash(username, professorId) {
  return crypto
    .createHash("sha256")
    .update(username + professorId + JWT_SECRET)
    .digest("hex");
}

/**
 * Look up a User document from a decoded JWT payload.
 * Students from PESU-SSO may only have `username` (no `id`).
 */
async function findDbUser(jwtPayload) {
  if (jwtPayload?.id) return User.findById(jwtPayload.id);
  if (jwtPayload?.username) return User.findOne({ username: jwtPayload.username });
  return null;
}

// POST /reviews — Submit a new review
router.post("/", verifyToken, checkProfanity, async (req, res) => {
  try {
    const {
      professorId, rating, teachingQuality, difficulty,
      gradingStrictness, attendanceStrictness, reviewText, tags,
    } = req.body;

    if (!professorId || !rating || !teachingQuality || !difficulty || !gradingStrictness || !attendanceStrictness) {
      return res.status(400).json({ error: "All rating fields are required" });
    }

    const professor = await Professor.findById(professorId);
    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }

    const ratingFields = [rating, teachingQuality, difficulty, gradingStrictness, attendanceStrictness];
    for (const r of ratingFields) {
      if (r < 1 || r > 5) {
        return res.status(400).json({ error: "All ratings must be between 1 and 5" });
      }
    }

    if (reviewText && reviewText.length > 300) {
      return res.status(400).json({ error: "Review text cannot exceed 300 characters" });
    }

    const dbUser = await findDbUser(req.user);
    const isShadowBanned = dbUser?.isShadowBanned === true;

    // Academic verification for students
    let studentHash = null;
    if (req.user.role === "student") {
      const allowedProfessors = req.user.allowedProfessors || [];

      if (allowedProfessors.length === 0) {
        return res.status(403).json({
          error: "Your academic history could not be verified. Please log out and sign in again.",
        });
      }

      if (!isMemberOf(professor.name, allowedProfessors)) {
        return res.status(403).json({
          error: "You can only review professors who have taught you.",
        });
      }

      studentHash = computeStudentHash(req.user.username, professorId);

      const existing = await Review.findOne({ professorId, studentHash });
      if (existing) {
        return res.status(400).json({ error: "You have already reviewed this professor." });
      }
    }

    const review = new Review({
      professorId, rating, teachingQuality, difficulty,
      gradingStrictness, attendanceStrictness,
      reviewText: reviewText || "",
      tags: tags || [],
      studentHash,
      isHidden: isShadowBanned,
    });

    await review.save();

    if (!isShadowBanned) {
      await updateProfessorAggregates(professorId);

      if (dbUser) {
        try { await applyReward(dbUser._id); }
        catch (err) { console.warn("[Reviews] Trust reward failed:", err.message); }
      }
    }

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// GET /reviews/:professorId — Get reviews for a professor
router.get("/:professorId", async (req, res) => {
  try {
    const { professorId } = req.params;

    // Parse optional auth to determine visibility
    let requestingUser = null;
    let requestingStudentHash = null;
    let isRequestingAdmin = false;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
        isRequestingAdmin = decoded.role === "admin";

        if (decoded.username) {
          requestingStudentHash = computeStudentHash(decoded.username, professorId);
        }

        requestingUser = await findDbUser(decoded);
      } catch (_) {
        // Invalid token — treat as anonymous
      }
    }

    const isRequestingShadowBanned = requestingUser?.isShadowBanned === true;

    // Build query based on visibility
    let reviews;
    if (isRequestingAdmin) {
      reviews = await Review.find({ professorId }).sort({ createdAt: -1 });
    } else if (isRequestingShadowBanned && requestingStudentHash) {
      reviews = await Review.find({
        professorId,
        $or: [
          { isHidden: false },
          { isHidden: true, studentHash: requestingStudentHash },
        ],
      }).sort({ createdAt: -1 });
    } else {
      reviews = await Review.find({ professorId, isHidden: false }).sort({ createdAt: -1 });
    }

    // Breakdown only from visible reviews
    const visibleReviews = reviews.filter(r => !r.isHidden);
    const count = visibleReviews.length;
    let breakdown = null;

    if (count > 0) {
      const sum = (field) => visibleReviews.reduce((acc, r) => acc + r[field], 0);
      breakdown = {
        overall: parseFloat((sum("rating") / count).toFixed(2)),
        teachingQuality: parseFloat((sum("teachingQuality") / count).toFixed(2)),
        difficulty: parseFloat((sum("difficulty") / count).toFixed(2)),
        gradingStrictness: parseFloat((sum("gradingStrictness") / count).toFixed(2)),
        attendanceStrictness: parseFloat((sum("attendanceStrictness") / count).toFixed(2)),
      };
    }

    // Annotate editable reviews and strip internal fields
    let enhancedReviews = reviews.map(r => r.toObject());

    if (requestingStudentHash) {
      enhancedReviews = enhancedReviews.map(r => {
        if (r.studentHash === requestingStudentHash) {
          return { ...r, canEdit: true };
        }
        return r;
      });
    }

    if (!isRequestingAdmin) {
      enhancedReviews = enhancedReviews.map(({ isHidden, studentHash, ...rest }) => rest);
    }

    res.json({ reviews: enhancedReviews, breakdown, totalReviews: count });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// PUT /reviews/:id — Update an existing review
router.put("/:id", verifyToken, checkProfanity, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).select("+studentHash");
    if (!review) return res.status(404).json({ error: "Review not found" });

    const hash = computeStudentHash(req.user.username, review.professorId.toString());
    if (hash !== review.studentHash) {
      return res.status(403).json({ error: "You are not authorized to edit this review" });
    }

    const { rating, teachingQuality, difficulty, gradingStrictness, attendanceStrictness, reviewText, tags } = req.body;
    Object.assign(review, {
      rating, teachingQuality, difficulty, gradingStrictness, attendanceStrictness,
      reviewText: reviewText || "",
      tags: tags || [],
    });

    await review.save();

    if (!review.isHidden) {
      await updateProfessorAggregates(review.professorId);
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Failed to update review" });
  }
});

// DELETE /reviews/:id — Delete a review (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    const professorId = review.professorId;
    await Review.findByIdAndDelete(req.params.id);
    await updateProfessorAggregates(professorId);

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
