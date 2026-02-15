"use client"

import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScanSearch, Loader2, Sparkles } from "lucide-react"

interface MessageInputProps {
  message: string
  onMessageChange: (value: string) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export function MessageInput({
  message,
  onMessageChange,
  onAnalyze,
  isAnalyzing,
}: MessageInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <div className="group relative overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:glow-primary">
        {/* Subtle animated border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: "linear-gradient(135deg, hsl(187 80% 48% / 0.05), transparent, hsl(187 80% 48% / 0.05))",
          }}
        />

        <div className="relative p-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Paste suspicious message</span>
          </div>

          <label htmlFor="message-input" className="sr-only">
            Paste suspicious message
          </label>
          <Textarea
            id="message-input"
            placeholder="Paste a suspicious SMS, WhatsApp message, email, or social media DM..."
            className="min-h-[140px] resize-none border-0 bg-secondary/40 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground/60">
                {message.length > 0
                  ? `${message.length} characters`
                  : "SMS, WhatsApp, email & social media"}
              </p>
              {message.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-1.5 w-1.5 rounded-full bg-success"
                />
              )}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={onAnalyze}
                disabled={!message.trim() || isAnalyzing}
                className="relative gap-2 rounded-xl bg-primary px-7 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:shadow-none"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ScanSearch className="h-4 w-4" />
                    Analyze Message
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
