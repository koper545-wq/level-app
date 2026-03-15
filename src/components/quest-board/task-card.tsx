"use client";

import { motion } from "framer-motion";
import type { Task } from "@/types";
import { useAreaStore } from "@/stores/area-store";

interface Props {
  task: Task;
  variant?: "focus" | "queue";
  onComplete: () => void;
}

export function TaskCard({ task, variant = "queue", onComplete }: Props) {
  const area = task.area || useAreaStore.getState().getAreaById(task.area_id || "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.15 } }}
      className={`
        flex items-center gap-3 p-4 bg-surface border border-border rounded-card
        ${variant === "focus" ? "ring-1 ring-accent/20" : ""}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={onComplete}
        className={`
          flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors
          hover:border-accent hover:bg-accent/10
          ${variant === "focus" ? "border-accent" : "border-border"}
        `}
        aria-label="Ukoncz zadanie"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${variant === "focus" ? "font-medium" : ""}`}>
          {task.title}
        </p>
      </div>

      {/* Area chip */}
      {area && (
        <span
          className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: area.color }}
        >
          {area.name}
        </span>
      )}

      {/* XP badge */}
      <span className="flex-shrink-0 text-xs font-mono text-foreground-secondary">
        +{task.xp_value}
      </span>
    </motion.div>
  );
}
