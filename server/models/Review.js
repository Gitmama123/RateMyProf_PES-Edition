const mongoose = require("mongoose");

// Review schema – anonymous review linked to a professor
const reviewSchema = new mongoose.Schema({
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professor",
    required: true,
  },
  // Overall rating (1-5)
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  teachingQuality: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  gradingStrictness: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  attendanceStrictness: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  // Optional text review (max 300 chars for moderation)
  reviewText: {
    type: String,
    trim: true,
    maxlength: [300, "Review text cannot exceed 300 characters"],
    default: "",
  },
  // Tags like "chill", "strict", "slides reader", etc.
  tags: {
    type: [String],
    default: [],
  },
  studentHash: {
    type: String,
    required: false,
  },

  // ─── Shadow Ban / Moderation ──────────────────────────────────────────────
  /**
   * isHidden: When true, this review was submitted by a shadow-banned user.
   * Hidden reviews:
   *   - Are NOT returned to public GET requests
   *   - Are NOT included in professor rating aggregates
   *   - ARE visible to the submitting user (so they are unaware of the ban)
   *   - ARE visible to admins
   */
  isHidden: {
    type: Boolean,
    default: false,
    index: true, // Indexed for efficient filtered queries
  },
  // ──────────────────────────────────────────────────────────────────────────

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Sparse unique index to prevent duplicate reviews from the same student on the same professor
// The partialFilterExpression ensures legacy reviews (without a hash) aren't constrained.
reviewSchema.index(
  { professorId: 1, studentHash: 1 },
  { unique: true, partialFilterExpression: { studentHash: { $exists: true, $type: "string" } } }
);

module.exports = mongoose.model("Review", reviewSchema);

