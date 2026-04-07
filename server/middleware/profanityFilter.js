/**
 * profanityFilter.js  [LEGACY SHIM]
 * -----------------------------------
 * This file is kept for backward-compatibility only.
 * All logic has been migrated to:
 *
 *   middleware/profanityMiddleware.js  ← new middleware
 *   utils/profanity/detector.js        ← detection engine
 *   utils/profanity/wordList.js        ← word list
 *   utils/profanity/normalize.js       ← text normaliser
 *   utils/profanity/scoring.js         ← severity scoring
 *   utils/profanity/censor.js          ← content censoring
 *   services/trustService.js           ← trust system
 *
 * Any existing code that imports from this file will continue to work.
 */

const { checkProfanity, profanityMiddleware } = require("./profanityMiddleware");
const { containsProfanity } = require("../utils/profanity/detector");

module.exports = { profanityMiddleware, checkProfanity, containsProfanity };
