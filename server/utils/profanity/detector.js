/**
 * detector.js
 * -----------
 * Core profanity detection engine.
 *
 * Exports:
 *   containsProfanity(text) → { found: boolean, word: string|null, score: number }
 *   getProfanityScore(text) → number
 *   getMatches(text)        → Array<{ word: string, score: number }>
 */

const { normalizeText, tokenize } = require("./normalize");
const { getSeverityScore, WHITELIST } = require("./wordList");

// Phrases that span multiple tokens after tokenisation.
// Spaced-letter variants (f u c k) are handled by the normalizer and excluded here.
const COMPOUND_PHRASES = new Map([
  ["mother fucker",   3],
  ["mother fucking",  3],
  ["son of a bitch",  3],
  ["son of bitch",    3],
  ["piece of shit",   3],
  ["dumb fuck",       3],
  ["cluster fuck",    3],
  ["shit head",       3],
  ["dick head",       3],
  ["jack ass",        1],
  ["dumb ass",        1],
  ["bad ass",         1],
  ["kick ass",        1],
  ["ass hole",        1],
]);

function containsProfanity(text) {
  const { matches, totalScore } = _analyse(text);
  return {
    found: matches.length > 0,
    word: matches.length > 0 ? matches[0].word : null,
    score: totalScore,
  };
}

function getProfanityScore(text) {
  return _analyse(text).totalScore;
}

function getMatches(text) {
  return _analyse(text).matches;
}

function _analyse(text) {
  if (!text || typeof text !== "string") {
    return { totalScore: 0, matches: [] };
  }

  const matches = [];
  let totalScore = 0;

  const normalized = normalizeText(text);
  const tokens = tokenize(normalized);

  // Compound phrase scan on the full normalised string
  for (const [phrase, score] of COMPOUND_PHRASES) {
    if (normalized.includes(phrase)) {
      matches.push({ word: phrase, score });
      totalScore += score;
    }
  }

  // Token-level scan — deduplicate repeated occurrences of the same word
  const seen = new Set();
  for (const token of tokens) {
    if (WHITELIST.has(token) || seen.has(token)) continue;
    const score = getSeverityScore(token);
    if (score > 0) {
      seen.add(token);
      matches.push({ word: token, score });
      totalScore += score;
    }
  }

  return { totalScore, matches };
}

module.exports = { containsProfanity, getProfanityScore, getMatches };
