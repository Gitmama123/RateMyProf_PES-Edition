/**
 * censor.js
 * ---------
 * Optional text redaction: replaces profane words with first letter + "***".
 * Example: "shit" → "s***"
 */

const { normalizeText, tokenize } = require("./normalize");
const { getSeverityScore, WHITELIST } = require("./wordList");

/**
 * @param {string} word
 * @returns {string} Redacted form, e.g. "f***"
 */
function redactWord(word) {
  if (!word || word.length === 0) return word;
  return word[0] + "***";
}

/**
 * Replaces profane words in raw text while preserving original casing/spacing.
 * @param {string} text - Raw user input.
 * @returns {string} Censored text.
 */
function censorText(text) {
  if (!text || typeof text !== "string") return text;

  const normalized = normalizeText(text);
  const tokens = tokenize(normalized);

  const profaneTokens = new Set();
  for (const token of tokens) {
    if (!WHITELIST.has(token) && getSeverityScore(token) > 0) {
      profaneTokens.add(token);
    }
  }

  if (profaneTokens.size === 0) return text;

  let result = text;
  for (const profaneWord of profaneTokens) {
    const escaped = profaneWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, (match) => redactWord(match));
  }

  return result;
}

module.exports = { censorText, redactWord };
