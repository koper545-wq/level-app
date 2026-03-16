"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBonusQuestStore } from "@/stores/bonus-quest-store";

export function BonusQuestBanner() {
  const activeQuest = useBonusQuestStore((s) => s.activeQuest);
  const expiresAt = useBonusQuestStore((s) => s.expiresAt);
  const clearQuest = useBonusQuestStore((s) => s.clearQuest);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        clearQuest();
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, clearQuest]);

  return (
    <AnimatePresence>
      {activeQuest && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="mb-4 p-4 bg-accent/10 border-2 border-accent/40 rounded-card relative overflow-hidden"
        >
          {/* Pulsing background */}
          <motion.div
            className="absolute inset-0 bg-accent/5"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-[10px] uppercase tracking-wider text-accent font-bold">
                  Bonus Quest
                </span>
                <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-bold">
                  2x XP
                </span>
              </div>
              <span className="text-sm font-mono text-accent font-bold">
                {timeLeft}
              </span>
            </div>
            <p className="text-sm font-medium">{activeQuest.title}</p>
            <p className="text-[10px] text-foreground-secondary mt-1">
              Ukoncz to zadanie przed koncem timera i zdobadz podwojne XP!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
