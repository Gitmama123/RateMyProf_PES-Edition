/**
 * admin.js — Admin-only moderation routes
 * All routes require authentication + admin role.
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Review = require("../models/Review");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { liftShadowBan, getTrustProfile } = require("../services/trustService");
const { updateProfessorAggregates } = require("../utils/aggregateCalculator");

router.use(verifyToken, isAdmin);

// GET /api/admin/users — list users with trust profiles (paginated, filterable)
router.get("/users", async (req, res) => {
  try {
    const page  = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.shadowBanned === "true")  filter.isShadowBanned = true;
    if (req.query.shadowBanned === "false") filter.isShadowBanned = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("username role trustScore flagCount isShadowBanned createdAt")
        .sort({ flagCount: -1, trustScore: 1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[Admin] List users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/admin/users/:id/trust
router.get("/users/:id/trust", async (req, res) => {
  try {
    const profile = await getTrustProfile(req.params.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/admin/users/:id/ban — manual shadow ban
router.post("/users/:id/ban", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ error: "Cannot shadow ban an admin account" });
    }

    user.isShadowBanned = true;
    await user.save();

    console.warn(`[Admin] Shadow ban: user=${user.username} by=${req.user.username}`);
    res.json({ success: true, message: `User ${user.username} has been shadow banned.` });
  } catch (err) {
    console.error("[Admin] Ban error:", err);
    res.status(500).json({ error: "Failed to shadow ban user" });
  }
});

// POST /api/admin/users/:id/unban — lift shadow ban and reset trust
router.post("/users/:id/unban", async (req, res) => {
  try {
    const user = await liftShadowBan(req.params.id);
    console.info(`[Admin] Unban: user=${user.username} by=${req.user.username}`);
    res.json({
      success: true,
      message: `Shadow ban lifted for ${user.username}. Trust score reset to 50.`,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// GET /api/admin/reviews/hidden — list hidden (shadow-banned) reviews
router.get("/reviews/hidden", async (req, res) => {
  try {
    const page  = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ isHidden: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("professorId", "name department"),
      Review.countDocuments({ isHidden: true }),
    ]);

    res.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[Admin] Hidden reviews error:", err);
    res.status(500).json({ error: "Failed to fetch hidden reviews" });
  }
});

// POST /api/admin/reviews/:id/unhide — make a hidden review public
router.post("/reviews/:id/unhide", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    review.isHidden = false;
    await review.save();
    await updateProfessorAggregates(review.professorId);

    res.json({ success: true, message: "Review is now publicly visible." });
  } catch (err) {
    res.status(500).json({ error: "Failed to unhide review" });
  }
});

module.exports = router;
