"use client";

import { AnimatePresence } from "framer-motion";
import type { Task } from "@/types";
import { useTaskStore } from "@/stores/task-store";
import { useUserStore } from "@/stores/user-store";
import { calculateTaskXP } from "@/lib/xp";
import { coinsForXP } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { TaskCard } from "./task-card";

interface Props {
  tasks: Task[];
  onComplete: (xpEarned: number) => void;
}

export function TaskQueue({ tasks, onComplete }: Props) {
  const completeTask = useTaskStore((s) => s.completeTask);
  const addXP = useUserStore((s) => s.addXP);
  const addCoins = useUserStore((s) => s.addCoins);
  const user = useUserStore((s) => s.user);

  async function handleComplete(task: Task) {
    const completed = await completeTask(task.id);
    if (!completed || !user) return;

    const { total } = calculateTaskXP({
      difficulty: task.difficulty,
      hasStreak: user.streak_current > 0,
      isFirstTaskOfDay: false,
      isNeglectedArea: false,
      isBossQuestTask: !!task.parent_goal_id,
    });

    const coins = coinsForXP(total);
    addXP(total);
    addCoins(coins);

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

    onComplete(total);
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mb-2 font-medium">
        Kolejka
      </p>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              variant="queue"
              onComplete={() => handleComplete(task)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
