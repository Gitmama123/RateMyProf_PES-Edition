/**
 * profanityMiddleware.js
 * ----------------------
 * Express middleware: normalise → detect → score → reject or pass.
 * Shadow ban enforcement is handled by the route handler, not here.
 */

const { getProfanityScore, getMatches } = require("../utils/profanity/detector");
const { evaluateScore } = require("../utils/profanity/scoring");
const { censorText } = require("../utils/profanity/censor");
const { applyViolation } = require("../services/trustService");

/**
 * Profanity check middleware.
 * Expects req.user (from verifyToken) and req.body.reviewText.
 */
async function checkProfanity(req, res, next) {
  const { reviewText } = req.body;

  if (!reviewText || typeof reviewText !== "string" || reviewText.trim() === "") {
    return next();
  }

  const rawScore = getProfanityScore(reviewText);
  const decision = evaluateScore(rawScore);

  if (decision.band === "CLEAN") {
    return next();
  }

  if (decision.shouldReject) {
    // Apply trust violation if user is authenticated
    if (req.user?.id) {
      try {
        await applyViolation(req.user.id);
      } catch (err) {
        console.error("[ProfanityMiddleware] Trust update failed:", err.message);
      }
    }

    const matches = getMatches(reviewText);
    console.warn(
      `[ProfanityMiddleware] REJECTED | user=${req.user?.username || "anon"} | ` +
      `score=${rawScore} | band=${decision.band} | ` +
      `matches=[${matches.map(m => m.word).join(", ")}]`
    );

    return res.status(400).json({
      error: "Review contains inappropriate language.",
    });
  }

  // Mild content — optionally censor in-place
  if (decision.shouldCensor) {
    req.body.reviewText = censorText(reviewText);
  }

  return next();
}

module.exports = {
  checkProfanity,
  profanityMiddleware: checkProfanity, // backward-compat alias
};
