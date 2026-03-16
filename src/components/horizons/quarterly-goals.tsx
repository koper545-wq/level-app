"use client";

import { useMemo } from "react";
import { useGoalStore } from "@/stores/goal-store";
import { GoalCard } from "./goal-card";
import { MAX_QUARTERLY_GOALS } from "@/lib/constants";

export function QuarterlyGoals() {
  const goals = useGoalStore((s) => s.goals);

  const activeGoals = useMemo(
    () =>
      goals
        .filter((g) => g.status === "active")
        .sort((a, b) => {
          if (a.is_boss && !b.is_boss) return -1;
          if (!a.is_boss && b.is_boss) return 1;
          return 0;
        }),
    [goals]
  );

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
