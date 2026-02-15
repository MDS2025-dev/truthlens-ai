const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

// Load environment variables from .env
// Example: GROQ_API_KEY=your_groq_api_key_here
dotenv.config();

// Create Express app
const app = express();

// Middleware: allow frontend requests and JSON body parsing
app.use(cors());
app.use(express.json());

// Fallback response (used when AI call or parsing fails)
const FALLBACK_RESPONSE = {
  riskScore: 50,
  riskLevel: "Medium",
  reasoning: ["Unable to fully analyze message safely"],
  actions: ["Verify sender manually"],
};

// TruthLens AI master prompt: prevents score flattening, ensures score matches reasoning
const TRUTHLENS_SYSTEM_PROMPT = `You are TruthLens AI, an advanced AI system that analyzes messages for potential scams, frauds, phishing, or malicious intent.
Your task is to **assign a numeric risk score (0–100%)** to each message based on how dangerous or suspicious it is, while also providing reasoning that explains the score.

Follow these instructions carefully:

1️⃣ **Risk Categories & Score Ranges**
- Low Risk → 0–30%
- Medium Risk → 31–69%
- High Risk → 70–100%

2️⃣ **Scoring Criteria**
- Check for scam keywords, urgent requests, phishing patterns, suspicious links, impersonation attempts, or offers too good to be true.
- Consider context, phrasing, and logical reasoning — not just isolated words.
- If reasoning indicates high danger, assign a high numeric score (≥70%).
- If reasoning indicates moderate concern, assign medium numeric score (31–69%).
- If reasoning indicates low or no risk, assign low numeric score (0–30%).

3️⃣ **Consistency Rule**
- The **numeric score must match the AI's explanation**. Do not output a low score if your reasoning clearly identifies a high-risk message.
- Never cap the score arbitrarily at a low value — always reflect the true risk level indicated by your reasoning.

4️⃣ **Output Format**
Respond strictly in the following JSON format. No markdown, no backticks, no text outside the JSON.

- **reasoning**: Provide as an array of distinct points. Include as many as apply (do NOT limit to 3). Example: ["point 1", "point 2", "point 3", ...]
- **actions**: Provide all recommended steps as an array. Include as many as needed (do NOT limit to 3). Example: ["step 1", "step 2", ...]

{
  "risk_score": <numeric score between 0-100>,
  "risk_level": "<Low / Medium / High>",
  "reasoning": ["<reason 1>", "<reason 2>", ...],
  "actions": ["<action 1>", "<action 2>", ...]
}

5️⃣ **Edge Cases Handling**
- Ambiguous messages → assign medium risk (31–69%) with reasoning explaining uncertainty.
- Extremely obvious scams → assign high risk (70–100%).
- Completely safe messages → assign low risk (0–30%).

6️⃣ **Test Reliability**
- The numeric score must **accurately reflect the qualitative assessment** in reasoning.
- High-risk messages → score ≥70%. Medium-risk → 31–69%. Low-risk → ≤30%.`;

// Configure OpenAI SDK for Groq (OpenAI-compatible API)
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Helper: safely parse model output into JSON
// 1) Try direct JSON.parse
// 2) If it fails, strip markdown fences/backticks and try again
// 3) Return null if still invalid
function safeParseJson(content) {
  if (typeof content !== "string") return null;

  try {
    return JSON.parse(content);
  } catch (_err) {
    // Continue to cleanup path
  }

  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_err) {
    return null;
  }
}

// Simple test route to verify backend is running
app.get("/", (req, res) => {
  res.send("TruthLens AI Backend Running \uD83D\uDE80");
});
// POST /analyze
// Body: { message: string }
// Response: structured JSON for frontend
app.post("/analyze", async (req, res) => {
  const { message } = req.body || {};

  // Basic input validation for stability
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "Invalid input. 'message' must be a non-empty string.",
    });
  }

  try {
    const aiResponse = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        { role: "system", content: TRUTHLENS_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    const raw = aiResponse?.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJson(raw);

    if (!parsed) {
      return res.json(FALLBACK_RESPONSE);
    }

    console.log("RAW AI RESPONSE:", parsed);

    // Use AI's risk_score directly (no keyword-based override) so score matches reasoning
    let riskScore = parseInt(parsed?.risk_score ?? parsed?.riskScore);
    if (isNaN(riskScore)) riskScore = 50;
    riskScore = Math.max(0, Math.min(100, riskScore));

    // reasoning: accept array (all items) or single string (wrap in array)
    let reasoning = parsed?.reasoning;
    if (typeof reasoning === "string" && reasoning.trim()) {
      reasoning = [reasoning.trim()];
    } else if (Array.isArray(reasoning)) {
      reasoning = reasoning.filter((r) => typeof r === "string" && r.trim());
    } else {
      reasoning = [];
    }
    if (reasoning.length === 0) reasoning = ["No reasoning provided."];

    // actions: pass through all (no limit)
    let actions = Array.isArray(parsed?.actions)
      ? parsed.actions.filter((a) => typeof a === "string" && a.trim())
      : [];
    if (actions.length === 0) actions = ["Verify sender manually"];

    // risk_level from AI; fallback from score only if missing or invalid
    const levelFromAi = parsed?.risk_level ?? parsed?.riskLevel;
    const validLevels = ["Low", "Medium", "High"];
    let riskLevel = validLevels.includes(levelFromAi) ? levelFromAi : null;
    if (!riskLevel) {
      riskLevel = riskScore >= 70 ? "High" : riskScore >= 31 ? "Medium" : "Low";
    }

    return res.json({
      riskScore,
      riskLevel,
      reasoning,
      actions,
    });
  } catch (error) {
    // On API/network/model errors, return fallback JSON
    console.error("Groq analyze error:", error?.message || error);
    return res.json(FALLBACK_RESPONSE);
  }
});

// Start server on port 5000
app.listen(5000, () => {
  console.log("TruthLens AI backend running on http://localhost:5000");
});


