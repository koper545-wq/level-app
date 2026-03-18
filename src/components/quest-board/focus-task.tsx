"use client";

import type { Task } from "@/types";
import { handleTaskCompletion, type CompletionResult } from "@/lib/complete-task";
import { TaskCard } from "./task-card";

interface Props {
  task: Task;
  onComplete: (xpEarned: number, milestone: CompletionResult["milestone"]) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function FocusTask({ task, onComplete, selectable, selected, onSelect }: Props) {
  async function handleComplete() {
    const result = await handleTaskCompletion(task);
    if (result) {
      onComplete(result.xpEarned, result.milestone);
    }
  }

  return (
    <div className="mb-4">
      <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mb-2 font-medium">
        Focus
      </p>
      <TaskCard
        task={task}
        variant="focus"
        onComplete={handleComplete}
        selectable={selectable}
        selected={selected}
        onSelect={onSelect}
      />
    </div>
  );
}
