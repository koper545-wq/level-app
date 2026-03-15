"use client";

import type { Goal } from "@/types";
import { useAreaStore } from "@/stores/area-store";
import { motion } from "framer-motion";

interface Props {
  goal: Goal;
}

export function GoalCard({ goal }: Props) {
  const area = goal.area || useAreaStore.getState().getAreaById(goal.area_id || "");

  return (
    <motion.div
      layout
      className={`bg-surface border rounded-card p-4 ${
        goal.is_boss
          ? "border-accent/30 ring-1 ring-accent/10"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {goal.is_boss && (
            <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium uppercase">
              Boss
            </span>
          )}
          <h3 className="text-sm font-medium">{goal.title}</h3>
        </div>

        {area && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full text-white flex-shrink-0"
            style={{ backgroundColor: area.color }}
          >
            {area.name}
          </span>
        )}
      </div>

      {goal.description && (
        <p className="text-xs text-foreground-secondary mb-3 line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: goal.is_boss ? "#3D4FE0" : area?.color || "#6B6B6B",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress_percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-mono text-foreground-secondary w-8 text-right">
          {goal.progress_percent}%
        </span>
      </div>

      {goal.target_date && (
        <p className="text-[10px] text-foreground-secondary mt-2">
          Termin: {new Date(goal.target_date).toLocaleDateString("pl-PL")}
        </p>
      )}
    </motion.div>
  );
}
