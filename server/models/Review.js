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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
