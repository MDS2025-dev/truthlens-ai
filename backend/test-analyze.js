/**
 * TruthLens AI — scenario tests
 * Run with: node test-analyze.js
 * Ensure backend is running: npm run dev (or node server.js) on port 5000
 */

const BASE = "http://localhost:5000";

async function analyze(message) {
  const res = await fetch(`${BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function inRange(score, low, high) {
  return score >= low && score <= high;
}

function levelFromScore(score) {
  if (score >= 70) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

const scenarios = [
  {
    name: "Obvious scam (urgent + fake link + account suspended)",
    message:
      "URGENT! Your bank account has been suspended. Click here immediately to verify: http://secure-bank-login.com or you will lose access forever!",
    expectLevel: "High",
    expectMinScore: 70,
  },
  {
    name: "Phishing / impersonation",
    message:
      "Hi, this is Microsoft Support. We detected suspicious activity on your account. Call this number now to avoid permanent lockout: 1-800-555-0199",
    expectLevel: "High",
    expectMinScore: 70,
  },
  {
    name: "Low risk — normal message",
    message: "Hey, are we still on for coffee tomorrow at 3pm? Let me know!",
    expectLevel: "Low",
    expectMaxScore: 30,
  },
  {
    name: "Ambiguous (delivery + link + request for info)",
    message:
      "Your package could not be delivered. Visit the link in our previous email to reschedule. Reply with your phone number for callback.",
    expectLevel: "Medium",
    expectMinScore: 31,
    expectMaxScore: 69,
  },
  {
    name: "Too good to be true / advance fee",
    message:
      "Congratulations! You've won $1,000,000 in the Nigerian lottery! Send your bank details to claim your prize within 24 hours.",
    expectLevel: "High",
    expectMinScore: 70,
  },
  {
    name: "Safe professional email",
    message:
      "Hi team, please find the Q4 report attached. Let me know if you have questions. Best, Sarah",
    expectLevel: "Low",
    expectMaxScore: 30,
  },
];

async function run() {
  console.log("TruthLens AI — Scenario tests\n");
  console.log("Backend:", BASE);
  console.log("---\n");

  let passed = 0;
  let scoreConsistent = 0;
  const results = [];

  for (const s of scenarios) {
    process.stdout.write(`Testing: ${s.name}... `);
    try {
      const out = await analyze(s.message);
      const score = out.riskScore ?? 50;
      const level = out.riskLevel ?? levelFromScore(score);
      const reasoning = out.reasoning ?? [];
      const actions = out.actions ?? [];

      const levelOk =
        level === s.expectLevel ||
        (s.expectMinScore !== undefined && score >= s.expectMinScore && level === "High") ||
        (s.expectMaxScore !== undefined && score <= s.expectMaxScore && level === "Low") ||
        (s.expectLevel === "Medium" && level === "Medium");
      const scoreInRange =
        (s.expectMinScore === undefined || score >= s.expectMinScore) &&
        (s.expectMaxScore === undefined || score <= s.expectMaxScore);
      const derivedLevel = levelFromScore(score);
      const consistent = level === derivedLevel;

      if (scoreInRange) passed++;
      if (consistent) scoreConsistent++;

      results.push({
        name: s.name,
        score,
        level,
        expectLevel: s.expectLevel,
        scoreInRange,
        levelOk,
        consistent,
        reasoningCount: reasoning.length,
        actionsCount: actions.length,
        reasoning: reasoning.slice(0, 2),
        actions: actions.slice(0, 2),
      });

      console.log(
        scoreInRange ? "OK" : "FAIL",
        `(score=${score}, level=${level}, reasoning=${reasoning.length}, actions=${actions.length})`
      );
    } catch (e) {
      console.log("ERROR:", e.message);
      results.push({
        name: s.name,
        error: e.message,
        scoreInRange: false,
        consistent: false,
      });
    }
  }

  console.log("\n--- Summary ---\n");
  results.forEach((r) => {
    if (r.error) {
      console.log(`[ERROR] ${r.name}: ${r.error}`);
      return;
    }
    const scoreOk = r.scoreInRange ? "✓" : "✗";
    const consOk = r.consistent ? "✓" : "✗";
    console.log(`${scoreOk} ${r.name}`);
    console.log(`   Score: ${r.score} | Level: ${r.level} | Score↔Level: ${consOk} | Reasons: ${r.reasoningCount} | Actions: ${r.actionsCount}`);
    if (r.reasoning?.length) console.log(`   Reasoning sample: ${r.reasoning[0]?.substring(0, 80)}...`);
  });

  const total = scenarios.length;
  const pct = total ? Math.round((passed / total) * 100) : 0;
  const consPct = total ? Math.round((scoreConsistent / total) * 100) : 0;
  console.log("\n--- Rating ---");
  console.log(`Score in expected range: ${passed}/${total} (${pct}%)`);
  console.log(`Score ↔ Level consistent: ${scoreConsistent}/${total} (${consPct}%)`);
  if (pct >= 80 && consPct >= 80) console.log("Overall: GOOD — scoring and consistency look correct.");
  else if (pct >= 60 || consPct >= 60) console.log("Overall: FAIR — some scenarios or consistency need improvement.");
  else console.log("Overall: NEEDS WORK — scoring or consistency often wrong.");
}

run().catch((e) => {
  console.error("Run failed:", e);
  process.exit(1);
});
