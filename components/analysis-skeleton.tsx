"use client"

import { motion } from "framer-motion"
import { ScanSearch } from "lucide-react"

function SkeletonBar({ width, delay = 0 }: { width: string; delay?: number }) {
  return (
    <div
      className="relative h-3 overflow-hidden rounded-full bg-secondary/50"
      style={{ width }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
      />
    </div>
  )
}

export function AnalysisSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* Scanning indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-8"
      >
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <ScanSearch className="h-7 w-7 animate-pulse text-primary" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm font-medium text-foreground">Analyzing message...</p>
          <p className="text-xs text-muted-foreground">AI is scanning for scam patterns</p>
        </div>
      </motion.div>

      {/* Skeleton cards */}
      <div className="overflow-hidden rounded-2xl glass-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-secondary/50" />
          <SkeletonBar width="120px" />
        </div>
        <SkeletonBar width="40%" delay={0.2} />
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary/50">
          <motion.div
            className="h-full rounded-full bg-primary/20"
            initial={{ width: 0 }}
            animate={{ width: "65%" }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl glass-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-secondary/50" />
          <SkeletonBar width="100px" />
        </div>
        <div className="flex flex-col gap-3">
          {[0.1, 0.2, 0.3].map((delay, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-secondary/20 p-3.5">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary/50" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <SkeletonBar width="90%" delay={delay} />
                <SkeletonBar width="60%" delay={delay + 0.1} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
