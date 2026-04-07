/**
 * normalize.js
 * ------------
 * Text normalisation pipeline for profanity detection.
 *
 * Handles common evasion techniques:
 *   • Leet-speak / character substitution  (@→a, 0→o, 1→i, $→s, 3→e, 4→a, 5→s)
 *   • Spaced-out words ("f u c k" → "fuck")
 *   • Repeated characters ("fuuuuck" → "fuck")
 *   • Punctuation removal
 *   • Mixed case
 */

// ─── Substitution map ─────────────────────────────────────────────────────────
// Maps obfuscation characters to their most-likely intended letter.
const SUBSTITUTIONS = {
  "@": "a",
  "0": "o",
  "1": "i",
  "!": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "$": "s",
  "7": "t",
  "+": "t",
  "8": "b",
  "(": "c",
  "<": "c",
  "|": "l",
};

// Digit-only substitutions applied AFTER lowercasing
// (allows '5H1T' → lowercase '5h1t' → 'shit' to work)
const DIGIT_SUBS = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b" };
const DIGIT_REGEX = /[01345 78]/g;

// Symbol-only substitutions applied BEFORE lowercasing
const SYMBOL_REGEX = /[@$!(<|]/g;

/**
 * normalizeText(text)
 * -------------------
 * Full pipeline: substitutions → lowercase → collapse spaces → strip punctuation.
 * Returns a clean string ready for tokenisation.
 *
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  if (!text || typeof text !== "string") return "";

  let normalized = text;

  // 1. Apply symbol substitutions (@, $, !, (, <, |) BEFORE lowercasing.
  normalized = normalized.replace(SYMBOL_REGEX, (ch) => SUBSTITUTIONS[ch] || ch);

  // 2. Lowercase everything.
  normalized = normalized.toLowerCase();

  // 2b. Apply digit substitutions AFTER lowercasing (so '5H1T' becomes 'shit').
  normalized = normalized.replace(DIGIT_REGEX, (ch) => DIGIT_SUBS[ch] || ch);

  // 3. Collapse spaced-out letters: "f u c k" → "fuck"
  //    Pattern: single chars separated by single spaces (e.g. "f u c k" or "f-u-c-k").
  normalized = collapseSpacedLetters(normalized);

  // 4. Remove repeated characters: "fuuuuck" → "fuck" (3+ same chars in a row → 1).
  //    Threshold is 3+ so natural doubles ("cool", "all", "look") are preserved.
  normalized = normalized.replace(/(.)\1{2,}/g, "$1");

  // 5. Remove punctuation except spaces (keep spaces for tokenisation).
  normalized = normalized.replace(/[^\w\s]/g, " ");

  // 6. Collapse multiple spaces.
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * collapseSpacedLetters(text)
 * ---------------------------
 * Detects patterns like "f u c k", "f-u-c-k", "f.u.c.k" and collapses them.
 * Only collapses runs of ≥3 spaced single characters (to avoid false positives
 * on normal sentence structures like "I am a student").
 *
 * @param {string} text
 * @returns {string}
 */
function collapseSpacedLetters(text) {
  // Match runs of 3+ single chars separated by a consistent delimiter (space, hyphen, dot, underscore).
  // E.g. "f u c k" → "fuck", "f-u-c-k" → "fuck"
  return text.replace(
    /\b([a-z0-9@$!][\s\-\._]){2,}[a-z0-9@$!]\b/gi,
    (match) => match.replace(/[\s\-\._]/g, "")
  );
}

/**
 * tokenize(normalizedText)
 * ------------------------
 * Splits a normalised string into word tokens.
 * Returns an array of lowercase strings.
 *
 * @param {string} normalizedText
 * @returns {string[]}
 */
function tokenize(normalizedText) {
  return normalizedText
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

module.exports = { normalizeText, tokenize, collapseSpacedLetters };
