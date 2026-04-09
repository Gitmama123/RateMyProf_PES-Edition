const mongoose = require("mongoose");

// Professor schema – stores professor info and computed rating aggregates
const professorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Professor name is required"],
      unique: true,
      trim: true,
      maxlength: 100,
    },
    designation: {
      type: String,
      trim: true,
    },
    profileUrl: {
      type: String,
      trim: true,
    },
    campus: {
      type: String,
      trim: true,
      default: "Unknown",
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      default: "Computer Science",
      trim: true,
      maxlength: 100,
    },
    subjects: {
      type: [String],
      default: [],
    },
    // Computed fields – updated whenever a review is added
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    averageTeachingQuality: {
      type: Number,
      default: 0,
    },
    averageDifficulty: {
      type: Number,
      default: 0,
    },
    averageGradingStrictness: {
      type: Number,
      default: 0,
    },
    averageAttendanceStrictness: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Average sentiment score of visible review texts (-1.0 to 1.0)
    averageSentimentScore: {
      type: Number,
      default: 0,
      min: -1,
      max: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Professor", professorSchema);
