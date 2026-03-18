"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/stores/session-store";

const PRESETS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "60 min", seconds: 60 * 60 },
  { label: "90 min", seconds: 90 * 60 },
];

export function SessionSelector() {
  const selectedTaskIds = useSessionStore((s) => s.selectedTaskIds);
  const startSession = useSessionStore((s) => s.startSession);
  const reset = useSessionStore((s) => s.reset);
  const [duration, setDuration] = useState(25 * 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-2xl border border-accent/30 bg-accent/5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Tryb sesji</p>
        <button
          onClick={reset}
          className="text-xs text-foreground-secondary hover:text-foreground transition-colors"
        >
          Anuluj
        </button>
      </div>

      <p className="text-[11px] text-foreground-secondary mb-3">
        Zaznacz zadania ponizej, wybierz czas i startuj
      </p>

      {/* Duration presets */}
      <div className="flex gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.seconds}
            onClick={() => setDuration(p.seconds)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              duration === p.seconds
                ? "bg-accent text-white"
                : "bg-surface border border-border text-foreground-secondary hover:border-accent/50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={() => startSession(duration)}
        disabled={selectedTaskIds.length === 0}
        className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-accent text-white hover:bg-accent/90"
      >
        Start sesji ({selectedTaskIds.length}{" "}
        {selectedTaskIds.length === 1 ? "zadanie" : "zadan"})
      </button>
    </motion.div>
  );
}
