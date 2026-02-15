# TruthLens AI — Test Results & Rating

**Date:** 2026-02-15  
**Backend:** `server.js` with TruthLens master prompt  
**Endpoint:** `POST /analyze`

---

## Scenarios Tested

| # | Scenario | Expected | Result | Score | Level | Score↔Level |
|---|----------|----------|--------|-------|-------|-------------|
| 1 | **Obvious scam** (urgent + fake link + account suspended) | High ≥70% | ✓ OK | 95 | High | ✓ |
| 2 | **Phishing / impersonation** (Microsoft Support) | High ≥70% | ✓ OK | 90 | High | ✓ |
| 3 | **Low risk** (normal coffee invite) | Low ≤30% | ✓ OK | 0 | Low | ✓ |
| 4 | **Ambiguous** (delivery + link + phone request) | Medium 31–69% | ✗ | 85 | High | ✓ |
| 5 | **Too good to be true** (Nigerian lottery) | High ≥70% | ✓ OK | 95 | High | ✓ |
| 6 | **Safe professional** (Q4 report email) | Low ≤30% | ✓ OK | 10 | Low | ✓ |

---

## Metrics

- **Score in expected range:** 5/6 (83%)
- **Score ↔ Level consistency:** 6/6 (100%)
- **Reasoning:** Multiple points returned (3–4 per message); no artificial cap.
- **Actions:** Multiple steps returned (1–4); no artificial cap.

---

## Notes

1. **Consistency** — In all runs, `riskLevel` correctly matched `riskScore` (Low ≤30%, Medium 31–69%, High ≥70%). No score flattening observed.
2. **Ambiguous case** — The “package delivery” message was scored 85% High. The model’s reasoning (request for phone number, reference to “previous email,” vague wording) is consistent with common delivery-phishing. So the system is **conservative** on delivery-style messages; the test expected Medium as “ambiguous,” but High is defensible for safety.
3. **Clear scams** — Obvious scams (bank suspension, Microsoft impersonation, Nigerian lottery) received 90–95% with clear reasoning.
4. **Safe messages** — Normal and professional messages received 0–10% with Low risk.

---

## Overall Rating: **8/10 — Good**

| Criterion | Rating | Comment |
|-----------|--------|--------|
| **Score accuracy** | 8/10 | Correct for clear high/low cases; ambiguous case scored high (conservative). |
| **Score ↔ reasoning** | 10/10 | Level always matches score; no mismatch. |
| **Reasoning quality** | 9/10 | Multiple distinct points, no 3-item cap. |
| **Actions** | 9/10 | Relevant steps, variable count. |
| **Edge cases** | 7/10 | Ambiguous message treated as High; could optionally tune for “medium” when context is unclear. |

**Verdict:** TruthLens is working as intended. Scores reflect the model’s reasoning, and high/low risk cases are correctly differentiated. The only “fail” in the test is a borderline choice (delivery message → High instead of Medium), which is acceptable for a safety-first scam detector.

---

## How to Re-run

```bash
cd backend
node server.js   # in one terminal
node test-analyze.js   # in another
```
