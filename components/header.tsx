"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export function Header() {
  return (
    <header className="flex flex-col items-center gap-5 text-center">
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30 glow-primary">
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="flex flex-col gap-2"
      >
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          <span className="text-primary">Truth</span>Lens AI
        </h1>
        <p className="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
          Paste any suspicious message below and let AI tell you if it is a scam.
        </p>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex items-center gap-4 text-xs text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          AI-Powered
        </span>
        <span className="h-3 w-px bg-border" />
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Real-time Analysis
        </span>
        <span className="h-3 w-px bg-border" />
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          Privacy-first
        </span>
      </motion.div>
    </header>
  )
}
