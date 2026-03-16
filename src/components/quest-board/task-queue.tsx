"use client";

import { AnimatePresence } from "framer-motion";
import type { Task } from "@/types";
import { handleTaskCompletion, type CompletionResult } from "@/lib/complete-task";
import { TaskCard } from "./task-card";

interface Props {
  tasks: Task[];
  onComplete: (xpEarned: number, milestone: CompletionResult["milestone"]) => void;
}

export function TaskQueue({ tasks, onComplete }: Props) {
  async function handleComplete(task: Task) {
    const result = await handleTaskCompletion(task);
    if (result) {
      onComplete(result.xpEarned, result.milestone);
    }
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
