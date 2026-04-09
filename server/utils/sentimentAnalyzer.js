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

/**
 * Analyze the sentiment of a review text using an external LLM API.
 *
 * @param {string} text - The review text to analyze.
 * @returns {{ score: number, label: "positive"|"neutral"|"negative" }}
 */
async function analyzeSentiment(text) {
  // If no text, return neutral default
  if (!text || text.trim().length === 0) {
    return { score: 0, label: "neutral" };
  }

  // If API is not configured, warn and return neutral
  if (!LLM_API_URL || !LLM_API_KEY || LLM_API_KEY === "your_api_key_here") {
    console.warn("[Sentiment] LLM API not configured. Returning neutral default.");
    return { score: 0, label: "neutral" };
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

    const parsed = JSON.parse(raw);

    const score = parseFloat(parsed.score);
    if (isNaN(score) || score < -1 || score > 1) {
      throw new Error(`Invalid score value: ${parsed.score}`);
    }

    // Derive label from score to ensure consistency
    const label =
      score > 0.2 ? "positive" : score < -0.2 ? "negative" : "neutral";

    return { score: parseFloat(score.toFixed(3)), label };
  } catch (err) {
    console.error("[Sentiment] Analysis failed:", err.message);
    // On failure, gracefully return neutral — never block a review submission
    return { score: 0, label: "neutral" };
  }
}

module.exports = { analyzeSentiment };
