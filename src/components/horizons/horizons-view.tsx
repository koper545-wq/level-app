"use client";

import { useEffect, useState } from "react";
import { useGoalStore } from "@/stores/goal-store";
import type { Goal } from "@/types";
import { QuarterlyGoals } from "./quarterly-goals";
import { WeeklyView } from "./weekly-view";
import { AddGoalDialog } from "./add-goal-dialog";

interface Props {
  initialGoals: Goal[];
}

export function HorizonsView({ initialGoals }: Props) {
  const setGoals = useGoalStore((s) => s.setGoals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [activeTab, setActiveTab] = useState<"quarter" | "week">("quarter");

  useEffect(() => {
    setGoals(initialGoals);
  }, [initialGoals, setGoals]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display">Horizons</h2>
        <button
          onClick={() => setShowAddGoal(true)}
          className="text-xs bg-accent text-white px-3 py-1.5 rounded-card font-medium hover:opacity-90 transition-opacity"
        >
          + Cel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface border border-border rounded-card p-1">
        <button
          onClick={() => setActiveTab("quarter")}
          className={`flex-1 text-xs py-2 rounded-md transition-colors ${
            activeTab === "quarter"
              ? "bg-foreground text-background"
              : "text-foreground-secondary"
          }`}
        >
          Kwartal
        </button>
        <button
          onClick={() => setActiveTab("week")}
          className={`flex-1 text-xs py-2 rounded-md transition-colors ${
            activeTab === "week"
              ? "bg-foreground text-background"
              : "text-foreground-secondary"
          }`}
        >
          Tydzien
        </button>
      </div>

      {activeTab === "quarter" ? <QuarterlyGoals /> : <WeeklyView />}

      {showAddGoal && (
        <AddGoalDialog onClose={() => setShowAddGoal(false)} />
      )}
    </div>
  );
}
