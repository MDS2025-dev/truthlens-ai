"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { MessageInput } from "@/components/message-input"
import { RiskScore } from "@/components/risk-score"
import { AIReasoning } from "@/components/ai-reasoning"
import { RecommendedAction } from "@/components/recommended-action"
import { AnalysisSkeleton } from "@/components/analysis-skeleton"
import { Shield, Zap, Eye, RotateCcw, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalysisResult {
  riskScore: number
  riskLevel: "Low" | "Medium" | "High"
  reasoning: string[]
  actions: string[]
}

interface BackendAnalysisResponse {
  riskScore?: number
  riskLevel?: "Low" | "Medium" | "High"
  reasoning?: string[]
  actions?: string[]
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Classify a reasoning line as "safe" (benign) or "alert" (warning/risk) for UI styling */
function reasonType(text: string): "alert" | "safe" {
  const lower = text.toLowerCase()
  const safePhrases = [
    "no suspicious",
    "no direct payment",
    "no payment request",
    "no suspicious link",
    "legitimate",
    "normal context",
    "personal connection",
    "clear expectation",
    "specific budget",
    "suggesting a personal",
    "benign",
    "low risk",
    "no urgency",
    "no links",
    "no urgent",
    "no impersonation",
    "no scam",
    "no phishing",
    "no malicious",
    "no fraud",
    "safe",
    "routine",
    "expected",
    "reasonable",
  ]
  const alertPhrases = [
    "suspicious",
    "phishing",
    "urgent",
    "warning",
    "impersonation",
    "verify account",
    "payment request",
    "malicious",
    "scam",
    "fraud",
    "risk",
    "threat",
    "coercive",
    "pressure",
    "fake",
    "fraudulent",
    "danger",
  ]
  const hasSafe = safePhrases.some((p) => lower.includes(p))
  const hasAlert = alertPhrases.some((p) => lower.includes(p))
  if (hasSafe && !hasAlert) return "safe"
  return "alert"
}

export default function Page() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = useCallback(async () => {
    if (!message.trim()) {
      setError("Please paste a message before analyzing.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? ""
      const analyzeUrl = apiBase ? `${apiBase.replace(/\/$/, "")}/analyze` : "/api/analyze"
      const res = await fetch(analyzeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        throw new Error(`Backend request failed: ${res.status}`)
      }

      let data: BackendAnalysisResponse | null = null
      try {
        data = (await res.json()) as BackendAnalysisResponse
      } catch (_parseError) {
        throw new Error("Invalid JSON from backend")
      }

      // Small delay to make AI flow feel intentional and readable.
      await wait(1200)
      console.log(data)

      const normalizedScore =
        typeof data?.riskScore === "number" && Number.isFinite(data.riskScore)
          ? Math.min(100, Math.max(0, data.riskScore))
          : 50

      const normalizedReasoning =
        data?.reasoning?.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0
        ) ?? []

      const normalizedActions =
        data?.actions?.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0
        ) ?? []

      // Derive riskLevel from score when missing so UI always matches score
      const level =
        data?.riskLevel && ["Low", "Medium", "High"].includes(data.riskLevel)
          ? data.riskLevel
          : normalizedScore >= 70
            ? "High"
            : normalizedScore >= 31
              ? "Medium"
              : "Low"

      setResult({
        riskScore: normalizedScore,
        riskLevel: level,
        reasoning: normalizedReasoning.length
          ? normalizedReasoning
          : ["Suspicious language detected"],
        actions: normalizedActions.length
          ? normalizedActions
          : ["Do not click links", "Verify sender", "Report message"],
      })
    } catch (error) {
      console.error("Analyze request failed:", error)
      await wait(1200)
      setError("We couldn't analyze this message right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [message])

  const handleReset = useCallback(() => {
    setMessage("")
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, hsl(187 80% 48% / 0.3), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full opacity-10 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, hsl(187 80% 48% / 0.4), transparent 70%)",
        }}
      />

      {/* Top accent line */}
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-24 pt-14 md:pt-20">
        <Header />

        <section className="mt-10" aria-label="Message input">
          <MessageInput
            message={message}
            onMessageChange={setMessage}
            onAnalyze={handleAnalyze}
            isAnalyzing={loading}
          />
        </section>

        {/* Loading state: clear AI thinking feedback */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.section
              key="loading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-8"
              aria-label="Loading analysis"
            >
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/25 p-3 text-sm text-foreground/85">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Analyzing message...</span>
              </div>
              <AnalysisSkeleton />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence mode="wait">
          {error && !loading && (
            <motion.section
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-8"
              aria-label="Analysis error"
            >
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8 flex flex-col gap-5"
              aria-label="Analysis results"
            >
              <RiskScore score={result?.riskScore ?? 0} />
              <AIReasoning
                reasons={(result?.reasoning ?? []).map((text) => ({
                  text,
                  type: reasonType(text),
                }))}
              />
              <RecommendedAction actions={result?.actions ?? []} />

              {/* Reset button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center pt-2"
              >
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2 rounded-xl border-border/50 bg-secondary/30 text-muted-foreground transition-all duration-200 hover:bg-secondary/50 hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  Analyze Another Message
                </Button>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Empty state feature cards */}
        <AnimatePresence>
          {!result && !loading && (
            <motion.section
              key="features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-14"
              aria-label="Features"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    icon: <Shield className="h-5 w-5 text-primary" />,
                    title: "Scam Detection",
                    description:
                      "Advanced AI analyzes message patterns to identify potential scams.",
                  },
                  {
                    icon: <Zap className="h-5 w-5 text-primary" />,
                    title: "Instant Analysis",
                    description:
                      "Get results in seconds with detailed reasoning and risk scores.",
                  },
                  {
                    icon: <Eye className="h-5 w-5 text-primary" />,
                    title: "Stay Informed",
                    description:
                      "Learn why a message is risky with clear, actionable explanations.",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    <FeatureCard {...feature} />
                  </motion.div>
                ))}
              </div>

              {/* Bottom info */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-8 text-center text-xs text-muted-foreground/40"
              >
                TruthLens AI does not store your messages. All analysis happens in real-time.
              </motion.p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group flex flex-col items-center gap-3 rounded-2xl glass-card p-6 text-center transition-all duration-300 hover:glow-primary">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="font-heading text-sm font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
