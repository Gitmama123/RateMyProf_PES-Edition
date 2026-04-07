/**
 * trustService.js
 * ---------------
 * Trust score management and shadow ban logic.
 *
 * Rules:
 *   - Clean review:    trustScore += REWARD  (capped at 100)
 *   - Violation:       trustScore -= PENALTY (clamped to 0), flagCount += 1
 *   - flagCount >= 5 OR trustScore <= 10 → shadow ban
 *   - Only an admin can lift a shadow ban.
 */

const User = require("../models/User");
const { SCORING_CONFIG } = require("../utils/profanity/scoring");

const TRUST_MIN = 0;
const TRUST_MAX = 100;

function clampTrust(score) {
  return Math.max(TRUST_MIN, Math.min(TRUST_MAX, score));
}

function shouldShadowBan(user) {
  return (
    user.flagCount >= SCORING_CONFIG.shadowBanFlagThreshold ||
    user.trustScore <= SCORING_CONFIG.shadowBanTrustThreshold
  );
}

/**
 * Penalise a user for a profanity violation.
 * @param {string} userId
 * @returns {Promise<{ user: object, wasBanned: boolean }>}
 */
async function applyViolation(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  const wasBannedBefore = user.isShadowBanned;

  user.flagCount += 1;
  user.trustScore = clampTrust(user.trustScore - SCORING_CONFIG.trustPenalty);

  if (!user.isShadowBanned && shouldShadowBan(user)) {
    user.isShadowBanned = true;
    console.warn(
      `[TrustService] Shadow banned user=${userId} ` +
      `(flags=${user.flagCount}, trust=${user.trustScore})`
    );
  }

  await user.save();
  return { user, wasBanned: user.isShadowBanned && !wasBannedBefore };
}

/**
 * Reward a user for a clean review submission.
 * Does not undo a shadow ban — only admin can do that.
 * @param {string} userId
 */
async function applyReward(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  if (!user.isShadowBanned) {
    user.trustScore = clampTrust(user.trustScore + SCORING_CONFIG.trustReward);
    await user.save();
  }

  return user;
}

/**
 * Admin-only: lift shadow ban and reset trust to 50.
 * @param {string} userId
 */
async function liftShadowBan(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  user.isShadowBanned = false;
  user.flagCount = 0;
  user.trustScore = 50;
  await user.save();
  return user;
}

/**
 * Returns the trust profile for a user (admin diagnostic).
 * @param {string} userId
 */
async function getTrustProfile(userId) {
  const user = await User.findById(userId)
    .select("trustScore flagCount isShadowBanned username");
  if (!user) throw new Error(`User not found: ${userId}`);
  return {
    username: user.username,
    trustScore: user.trustScore,
    flagCount: user.flagCount,
    isShadowBanned: user.isShadowBanned,
  };
}

module.exports = { applyViolation, applyReward, liftShadowBan, getTrustProfile, shouldShadowBan };
