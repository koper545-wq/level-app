"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types";
import { useTaskStore } from "@/stores/task-store";
import { TaskCard } from "./task-card";
import type { CompletionResult } from "@/lib/complete-task";

interface Props {
  tasks: Task[];
  onComplete: (xp: number, milestone: CompletionResult["milestone"]) => void;
}

export function BacklogTasks({ tasks, onComplete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const rescheduleTask = useTaskStore((s) => s.rescheduleTask);

  if (tasks.length === 0) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-2"
      >
        <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">
          Backlog ({tasks.length})
        </p>
        <div className="flex items-center gap-2">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-foreground-secondary transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1.5"
          >
            {tasks.map((task) => (
              <div key={task.id} className="relative">
                <TaskCard
                  task={task}
                  variant="queue"
                  onComplete={async () => {
                    const { handleTaskCompletion } = await import("@/lib/complete-task");
                    const result = await handleTaskCompletion(task);
                    if (result) onComplete(result.xpEarned, result.milestone);
                  }}
                />
                {/* Quick schedule button */}
                <button
                  onClick={() => rescheduleTask(task.id, today)}
                  className="absolute top-3 right-14 text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium hover:bg-accent/20 transition-colors"
                >
                  Na dzisiaj
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
