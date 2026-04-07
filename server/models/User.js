const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "student"],
    default: "user",
  },

  // ─── Trust & Moderation System ────────────────────────────────────────────
  /**
   * trustScore: Tracks user reputation. Starts at 50 (neutral).
   * Range: [0, 100]. Decremented on violations, incremented on clean reviews.
   */
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },

  /**
   * flagCount: Cumulative number of profanity violations submitted by this user.
   * Incremented each time the profanity middleware rejects their content.
   */
  flagCount: {
    type: Number,
    default: 0,
    min: 0,
  },

  /**
   * isShadowBanned: When true, the user's reviews are silently stored with
   * isHidden = true. The user sees success responses and their own reviews,
   * but their content never surfaces publicly or affects ratings.
   *
   * Triggered when: flagCount >= 5 OR trustScore <= 10.
   * Can only be lifted by an admin.
   */
  isShadowBanned: {
    type: Boolean,
    default: false,
  },
  // ──────────────────────────────────────────────────────────────────────────

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
