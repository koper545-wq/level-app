"use client";

import type { Task } from "@/types";
import { useTaskStore } from "@/stores/task-store";
import { useUserStore } from "@/stores/user-store";
import { calculateTaskXP } from "@/lib/xp";
import { coinsForXP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { checkAndUpdateStreak } from "@/lib/streaks";
import { TaskCard } from "./task-card";

interface Props {
  task: Task;
  onComplete: (xpEarned: number) => void;
}

export function FocusTask({ task, onComplete }: Props) {
  const completeTask = useTaskStore((s) => s.completeTask);
  const addXP = useUserStore((s) => s.addXP);
  const addCoins = useUserStore((s) => s.addCoins);
  const user = useUserStore((s) => s.user);

  async function handleComplete() {
    const completed = await completeTask(task.id);
    if (!completed || !user) return;

    // Calculate XP
    const { total } = calculateTaskXP({
      difficulty: task.difficulty,
      hasStreak: user.streak_current > 0,
      isFirstTaskOfDay: false, // simplified for now
      isNeglectedArea: false, // simplified for now
      isBossQuestTask: !!task.parent_goal_id,
    });

    const coins = coinsForXP(total);

    // Update stores
    addXP(total);
    addCoins(coins);

    // Log XP
    const supabase = createClient();
    supabase
      .from("xp_log")
      .insert({
        user_id: user.id,
        task_id: task.id,
        amount: total,
        reason: `task_complete:${task.difficulty}`,
      })
      .then();

    // Update streak
    const { newStreak } = await checkAndUpdateStreak(user.id);
    useUserStore.getState().updateStreak(newStreak);

    // Update goal progress if this task belongs to a goal
    if (task.parent_goal_id) {
      const { useGoalStore } = await import("@/stores/goal-store");
      useGoalStore.getState().updateProgress(task.parent_goal_id);
    }

    onComplete(total);
  }

  return (
    <div className="mb-4">
      <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mb-2 font-medium">
        Focus
      </p>
      <TaskCard task={task} variant="focus" onComplete={handleComplete} />
    </div>
  );
}
