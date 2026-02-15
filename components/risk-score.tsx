"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"

interface RiskScoreProps {
  score: number
}

function getRiskLevel(score: number) {
  if (score >= 70)
    return {
      label: "High Risk",
      color: "text-destructive",
      barClass: "bg-destructive animate-bar-glow",
      glowClass: "glow-destructive",
      badgeBg: "bg-destructive/15 text-destructive ring-1 ring-destructive/20",
      icon: ShieldAlert,
      description:
        "This message shows strong indicators of being a scam. Do not interact with it.",
    }
  if (score >= 40)
    return {
      label: "Medium Risk",
      color: "text-warning",
      barClass: "bg-warning",
      glowClass: "",
      badgeBg: "bg-warning/15 text-warning ring-1 ring-warning/20",
      icon: ShieldQuestion,
      description:
        "This message has some suspicious elements. Proceed with caution.",
    }
  return {
    label: "Low Risk",
    color: "text-success",
    barClass: "bg-success",
    glowClass: "",
    badgeBg: "bg-success/15 text-success ring-1 ring-success/20",
    icon: ShieldCheck,
    description:
      "This message appears to be safe, but always stay vigilant.",
  }
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1200
    const step = 16
    const increment = target / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, step)
    return () => clearInterval(timer)
  }, [target])

  return <>{count}</>
}

export function RiskScore({ score }: RiskScoreProps) {
  const risk = getRiskLevel(score)
  const Icon = risk.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={`overflow-hidden rounded-2xl glass-card p-6 transition-all duration-300 ${risk.glowClass}`}>
        {/* Header row */}
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className={`h-4 w-4 ${risk.color}`} />
          <span>Scam Risk Score</span>
        </div>

        {/* Score display */}
        <div className="mb-5 flex items-end gap-3">
          <span className={`font-heading text-6xl font-bold tabular-nums tracking-tight ${risk.color}`}>
            <AnimatedCounter target={score} />
            <span className="text-3xl text-muted-foreground/50">%</span>
          </span>
          <span className={`mb-2 rounded-full px-3 py-1 text-xs font-semibold ${risk.badgeBg}`}>
            {risk.label}
          </span>
        </div>

        {/* Animated progress bar */}
        <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
          <motion.div
            className={`h-full rounded-full ${risk.barClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Scam risk score: ${score}%`}
          />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {risk.description}
        </p>
      </div>
    </motion.div>
  )
}
