"use client";

import { motion } from "framer-motion";
import { useSessionStore } from "@/stores/session-store";

export function SessionSummary() {
  const completedInSession = useSessionStore((s) => s.completedInSession);
  const selectedTaskIds = useSessionStore((s) => s.selectedTaskIds);
  const xpInSession = useSessionStore((s) => s.xpInSession);
  const startedAt = useSessionStore((s) => s.startedAt);
  const duration = useSessionStore((s) => s.duration);
  const reset = useSessionStore((s) => s.reset);

  const totalSelected = selectedTaskIds.length;
  const allDone = completedInSession >= totalSelected;

  // Calculate actual time spent
  const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  const actualMinutes = Math.min(Math.floor(elapsed / 60), Math.floor(duration / 60));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-12 text-center"
    >
      <p className="text-4xl mb-2">{allDone ? "🎯" : "⏰"}</p>
      <h2 className="text-2xl font-display mb-2">
        {allDone ? "Sesja ukonczona!" : "Czas minal!"}
      </h2>
      <p className="text-sm text-foreground-secondary mb-8">
        {allDone
          ? "Wszystkie zadania zrobione"
          : `${completedInSession} z ${totalSelected} zadan ukonczonych`}
      </p>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-10">
        <div>
          <p className="text-3xl font-mono font-bold">{completedInSession}</p>
          <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mt-1">
            Zadan
          </p>
        </div>
        <div>
          <p className="text-3xl font-mono font-bold text-accent">+{xpInSession}</p>
          <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mt-1">
            XP
          </p>
        </div>
        <div>
          <p className="text-3xl font-mono font-bold">{actualMinutes}</p>
          <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mt-1">
            Minut
          </p>
        </div>
      </div>

      <button
        onClick={reset}
        className="px-8 py-3 rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-all"
      >
        Zamknij
      </button>
    </motion.div>
  );
}
