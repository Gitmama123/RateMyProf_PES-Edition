const axios = require("axios");

const LLM_API_URL = process.env.LLM_API_URL;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || "meta/llama-3.1-8b-instruct";

const SYSTEM_PROMPT = `You are a sentiment analysis engine. 
Given a student's review of a professor, respond with ONLY a JSON object in this exact format:
{"score": <float between -1.0 and 1.0>, "label": "<positive|neutral|negative>"}

Rules:
- score > 0.2  → label must be "positive"
- score < -0.2 → label must be "negative"
- otherwise    → label must be "neutral"
- Do NOT include any explanation, markdown, or extra text. Only the raw JSON.`;

// ─── Rule-Based Lexicon Sentiment Fallback ───────────────────────────────────

const POSITIVE_LEXICON = {
  great: 1.2, awesome: 1.4, excellent: 1.4, amazing: 1.4, outstanding: 1.5,
  brilliant: 1.4, fantastic: 1.4, wonderful: 1.3, best: 1.5, good: 0.8,
  nice: 0.8, helpful: 1.2, kind: 1.0, friendly: 1.0, caring: 1.2,
  passionate: 1.3, inspiring: 1.4, approachable: 1.2, clear: 1.0, engaging: 1.2,
  fair: 1.0, generous: 1.1, lenient: 1.1, understanding: 1.1, supportive: 1.2,
  patient: 1.0, easy: 0.8, fun: 0.9, love: 1.3, loved: 1.3, enjoyed: 1.1,
  recommend: 1.2, recommended: 1.2, top: 1.0, cool: 0.8, phenomenal: 1.4, gem: 1.4,
  perfect: 1.5, super: 0.8, impressive: 1.2, effective: 1.0, thorough: 0.9
};

const NEGATIVE_LEXICON = {
  terrible: 1.4, worst: 1.5, horrible: 1.4, awful: 1.4, rude: 1.3,
  unhelpful: 1.3, useless: 1.4, unfair: 1.4, harsh: 1.3, strict: 0.7,
  mean: 1.2, boring: 1.1, confusing: 1.2, disorganized: 1.2, arrogant: 1.3,
  poor: 1.0, bad: 1.0, hate: 1.3, hated: 1.3, avoid: 1.4, disaster: 1.4,
  nightmare: 1.5, tough: 0.6, difficult: 0.7, unreasonable: 1.3, waste: 1.4,
  dull: 1.0, stubborn: 1.1, ego: 1.2, scary: 1.1, scold: 1.2, scolds: 1.2,
  fail: 1.1, failing: 1.1, worst: 1.5, toxic: 1.5, hostile: 1.4
};

const INTENSIFIERS = new Set([
  "very", "extremely", "really", "super", "so", "highly", "absolutely",
  "totally", "incredibly", "exceptionally", "ultra", "extra", "deeply"
]);

const NEGATIONS = new Set([
  "not", "no", "never", "dont", "don't", "doesnt", "doesn't", "isnt",
  "isn't", "wasnt", "wasn't", "cant", "can't", "neither", "nor", "hardly", "barely"
]);

/**
 * Fallback rule-based sentiment analysis engine.
 * Computes sentiment score between -1.0 and 1.0 based on domain lexicon,
 * negations, and intensifiers.
 */
function analyzeSentimentRuleBased(text) {
  if (!text || text.trim().length === 0) {
    return { score: 0, label: "neutral" };
  }

  // Tokenize & normalize
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\']/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return { score: 0, label: "neutral" };
  }

  let totalScore = 0;
  let matchesCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    let posVal = POSITIVE_LEXICON[word] || 0;
    let negVal = NEGATIVE_LEXICON[word] || 0;

    if (posVal === 0 && negVal === 0) continue;

    let baseScore = posVal > 0 ? posVal : -negVal;

    // Check for intensifier immediately before
    const prevWord = i > 0 ? words[i - 1] : "";
    if (INTENSIFIERS.has(prevWord)) {
      baseScore *= 1.5;
    }

    // Check for negation up to 2 words before
    const prevWord2 = i > 1 ? words[i - 2] : "";
    if (NEGATIONS.has(prevWord) || NEGATIONS.has(prevWord2)) {
      baseScore = -baseScore * 0.8;
    }

    totalScore += baseScore;
    matchesCount++;
  }

  if (matchesCount === 0) {
    return { score: 0, label: "neutral" };
  }

  // Bounded non-linear normalization between -1.0 and 1.0
  const normalizedScore = Math.tanh(totalScore / 2.0);
  const score = parseFloat(normalizedScore.toFixed(3));
  const label = score > 0.2 ? "positive" : score < -0.2 ? "negative" : "neutral";

  return { score, label };
}

/**
 * Helper to extract JSON from raw LLM output strings (handling markdown blocks).
 */
function extractJsonString(raw) {
  const match = raw.match(/\{[\s\S]*?\}/);
  return match ? match[0] : raw;
}

/**
 * Analyze the sentiment of a review text using an external LLM API (if configured),
 * seamlessly falling back to the rule-based engine on failure or missing credentials.
 *
 * @param {string} text - The review text to analyze.
 * @returns {Promise<{ score: number, label: "positive"|"neutral"|"negative" }>}
 */
async function analyzeSentiment(text) {
  // If no text, return neutral default
  if (!text || text.trim().length === 0) {
    return { score: 0, label: "neutral" };
  }

  // If API is not configured, use rule-based analyzer
  if (!LLM_API_URL || !LLM_API_KEY || LLM_API_KEY === "your_api_key_here") {
    return analyzeSentimentRuleBased(text);
  }

  try {
    const response = await axios.post(
      `${LLM_API_URL}/chat/completions`,
      {
        model: LLM_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Review: "${text}"` },
        ],
        temperature: 0.0,
        max_tokens: 64,
      },
      {
        headers: {
          Authorization: `Bearer ${LLM_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty response from LLM API");

    const jsonStr = extractJsonString(raw);
    const parsed = JSON.parse(jsonStr);

    const score = parseFloat(parsed.score);
    if (isNaN(score) || score < -1 || score > 1) {
      throw new Error(`Invalid score value: ${parsed.score}`);
    }

    // Derive label from score to ensure consistency
    const label =
      score > 0.2 ? "positive" : score < -0.2 ? "negative" : "neutral";

    return { score: parseFloat(score.toFixed(3)), label };
  } catch (err) {
    console.warn("[Sentiment] LLM API call failed, falling back to rule-based engine:", err.message);
    return analyzeSentimentRuleBased(text);
  }
}

module.exports = { analyzeSentiment, analyzeSentimentRuleBased };

