"use client"

import { motion } from "framer-motion"
import {
  BrainCircuit,
  AlertTriangle,
  Link2,
  CreditCard,
  Clock,
  MessageSquareWarning,
  ShieldCheck,
} from "lucide-react"

interface ReasonItem {
  icon?: "urgency" | "payment" | "link" | "grammar" | "pressure"
  text: string
  /** "alert" = warning/risk (red). "safe" = benign (green + safe icon) */
  type?: "alert" | "safe"
}

interface AIReasoningProps {
  reasons: ReasonItem[]
}

const iconMap = {
  urgency: Clock,
  payment: CreditCard,
  link: Link2,
  grammar: MessageSquareWarning,
  pressure: AlertTriangle,
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export function AIReasoning({ reasons }: AIReasoningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
    >
      <div className="overflow-hidden rounded-2xl glass-card p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span>AI Reasoning</span>
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {reasons.length} flags
          </span>
        </div>

        {/* Reason list with staggered reveal */}
        <motion.ul
          className="flex flex-col gap-2.5"
          variants={container}
          initial="hidden"
          animate="show"
          role="list"
        >
          {reasons.map((reason, index) => {
            const isSafe = reason.type === "safe"
            const Icon = isSafe
              ? ShieldCheck
              : iconMap[reason.icon ?? "pressure"]
            return (
              <motion.li
                key={index}
                variants={item}
                className="group flex items-start gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors duration-200 hover:bg-secondary/60"
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${
                    isSafe
                      ? "bg-emerald-500/10 dark:bg-emerald-400/10"
                      : "bg-destructive/10"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isSafe
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    }`}
                  />
                </div>
                <span className="text-sm leading-relaxed text-foreground/85">
                  {reason.text}
                </span>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </motion.div>
  )
}
