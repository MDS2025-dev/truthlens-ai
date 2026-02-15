"use client"

import { motion } from "framer-motion"
import { Lightbulb, Ban, Flag, Trash2 } from "lucide-react"

interface RecommendedActionProps {
  actions: string[]
}

const actionIcons = [Ban, Flag, Trash2]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export function RecommendedAction({ actions }: RecommendedActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
    >
      <div className="overflow-hidden rounded-2xl glass-card p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Lightbulb className="h-4 w-4 text-warning" />
          <span>Recommended Actions</span>
        </div>

        {/* Action list */}
        <motion.ul
          className="flex flex-col gap-2.5"
          variants={container}
          initial="hidden"
          animate="show"
          role="list"
        >
          {actions.map((action, index) => {
            const Icon = actionIcons[index % actionIcons.length]
            return (
              <motion.li
                key={index}
                variants={item}
                className="group flex items-start gap-3 rounded-xl bg-accent/40 p-3.5 transition-colors duration-200 hover:bg-accent/60"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 group-hover:scale-110">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-primary/70">
                    Step {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/85">
                    {action}
                  </span>
                </div>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </motion.div>
  )
}
