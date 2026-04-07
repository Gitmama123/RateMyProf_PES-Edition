/**
 * scoring.js
 * ----------
 * Severity scoring and decision engine. Configurable via environment variables.
 *
 * Score bands:
 *   0     → CLEAN   (allow)
 *   1–2   → MILD    (allow or reject, configurable)
 *   3–4   → STRONG  (reject)
 *   5+    → EXTREME (reject)
 */

const SCORING_CONFIG = {
  /** Minimum score that triggers a reject (HTTP 400). */
  rejectThreshold: parseInt(process.env.PROFANITY_REJECT_THRESHOLD, 10) || 3,

  /** Whether mild profanity (score 1–2) passes through. Overridden if rejectThreshold ≤ 1. */
  allowMild: process.env.PROFANITY_ALLOW_MILD !== "false",

  /** Whether to auto-censor mild profanity that passes through. */
  censorMild: process.env.PROFANITY_CENSOR_MILD === "true",

  /** Trust score deducted per violation. */
  trustPenalty: parseInt(process.env.TRUST_PENALTY, 10) || 10,

  /** Trust score added per clean review. */
  trustReward: parseInt(process.env.TRUST_REWARD, 10) || 2,

  /** Flag count that triggers shadow ban (inclusive). */
  shadowBanFlagThreshold: parseInt(process.env.SHADOW_BAN_FLAG_THRESHOLD, 10) || 5,

  /** Trust score floor that triggers shadow ban (≤ this value). */
  shadowBanTrustThreshold: parseInt(process.env.SHADOW_BAN_TRUST_THRESHOLD, 10) || 10,
};

/**
 * Converts a raw profanity score into a decision.
 * @param {number} score
 * @returns {{ band: string, shouldReject: boolean, shouldCensor: boolean }}
 */
function evaluateScore(score) {
  if (score === 0) {
    return { band: "CLEAN", shouldReject: false, shouldCensor: false };
  }

  if (score >= 5) {
    return { band: "EXTREME", shouldReject: true, shouldCensor: false };
  }

  if (score >= SCORING_CONFIG.rejectThreshold) {
    return { band: "STRONG", shouldReject: true, shouldCensor: false };
  }

  // Mild (score 1–2)
  if (!SCORING_CONFIG.allowMild) {
    return { band: "MILD", shouldReject: true, shouldCensor: false };
  }

  return { band: "MILD", shouldReject: false, shouldCensor: SCORING_CONFIG.censorMild };
}

module.exports = { SCORING_CONFIG, evaluateScore };
