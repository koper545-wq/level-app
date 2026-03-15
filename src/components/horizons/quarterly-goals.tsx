"use client";

import { useGoalStore } from "@/stores/goal-store";
import { GoalCard } from "./goal-card";
import { MAX_QUARTERLY_GOALS } from "@/lib/constants";

export function QuarterlyGoals() {
  const activeGoals = useGoalStore((s) => s.activeGoals());

  if (activeGoals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-secondary text-sm">
          Brak celow kwartalnych
        </p>
        <p className="text-foreground-secondary text-xs mt-1">
          Dodaj pierwszy cel klikajac + Cel
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">
        Cele kwartalne ({activeGoals.length}/{MAX_QUARTERLY_GOALS})
      </p>
      {activeGoals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
