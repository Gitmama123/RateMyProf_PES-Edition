// Basic profanity filter middleware
// Checks review text against a list of banned words

const BANNED_WORDS = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "crap",
  "bastard",
  "dick",
  "piss",
  "slut",
  "whore",
  "cunt",
  "retard",
  "idiot",
  "stupid",
  "moron",
  "dumbass",
  "loser",
  "trash",
  "suck",
  "pussy",
  "asshole",
  "motherfucker"
];

/**
 * Checks if text contains any banned words (case-insensitive).
 * Returns the first matched word or null.
 */
function containsProfanity(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const word of BANNED_WORDS) {
    // Match whole words using word boundaries
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lower)) {
      return word;
    }
  }
  return null;
}

/**
 * Express middleware – rejects requests where reviewText contains profanity.
 */
function profanityMiddleware(req, res, next) {
  const { reviewText } = req.body;
  const match = containsProfanity(reviewText);
  if (match) {
    return res.status(400).json({
      error: "Review contains inappropriate language and cannot be submitted.",
    });
  }
  next();
}

module.exports = { profanityMiddleware, containsProfanity };
