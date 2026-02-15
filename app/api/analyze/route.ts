import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const FALLBACK_RESPONSE = {
  riskScore: 50,
  riskLevel: "Medium" as const,
  reasoning: ["Unable to fully analyze message safely"],
  actions: ["Verify sender manually"],
}

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
- High-risk messages → score ≥70%. Medium-risk → 31–69%. Low-risk → ≤30%.`

function safeParseJson(content: string): Record<string, unknown> | null {
  if (typeof content !== "string") return null
  try {
    return JSON.parse(content) as Record<string, unknown>
  } catch {
    // continue
  }
  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()
  try {
    return JSON.parse(cleaned) as Record<string, unknown>
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured. Add it in Vercel Environment Variables." },
      { status: 500 }
    )
  }

  let body: { message?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    )
  }

  const message = body?.message
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Invalid input. 'message' must be a non-empty string." },
      { status: 400 }
    )
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  })

  try {
    const aiResponse = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        { role: "system", content: TRUTHLENS_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    })

    const raw = aiResponse?.choices?.[0]?.message?.content ?? ""
    const parsed = safeParseJson(raw)

    if (!parsed) {
      return NextResponse.json(FALLBACK_RESPONSE)
    }

    let riskScore = parseInt(String(parsed?.risk_score ?? parsed?.riskScore))
    if (Number.isNaN(riskScore)) riskScore = 50
    riskScore = Math.max(0, Math.min(100, riskScore))

    let reasoning = parsed?.reasoning
    if (typeof reasoning === "string" && reasoning.trim()) {
      reasoning = [reasoning.trim()]
    } else if (Array.isArray(reasoning)) {
      reasoning = reasoning.filter((r) => typeof r === "string" && String(r).trim())
    } else {
      reasoning = []
    }
    if (!Array.isArray(reasoning) || reasoning.length === 0) {
      reasoning = ["No reasoning provided."]
    }

    let actions = Array.isArray(parsed?.actions)
      ? parsed.actions.filter((a) => typeof a === "string" && String(a).trim())
      : []
    if (actions.length === 0) actions = ["Verify sender manually"]

    const levelFromAi = parsed?.risk_level ?? parsed?.riskLevel
    const validLevels = ["Low", "Medium", "High"]
    let riskLevel =
      typeof levelFromAi === "string" && validLevels.includes(levelFromAi)
        ? levelFromAi
        : riskScore >= 70
          ? "High"
          : riskScore >= 31
            ? "Medium"
            : "Low"

    return NextResponse.json({
      riskScore,
      riskLevel,
      reasoning,
      actions,
    })
  } catch (error) {
    console.error("Groq analyze error:", error)
    return NextResponse.json(FALLBACK_RESPONSE)
  }
}
