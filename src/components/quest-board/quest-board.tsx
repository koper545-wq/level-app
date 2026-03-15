"use client";

import { useTaskStore } from "@/stores/task-store";
import { FocusTask } from "./focus-task";
import { TaskQueue } from "./task-queue";
import { QuickAdd } from "./quick-add";
import { DailySummaryBar } from "./daily-summary-bar";
import { VictoryScreen } from "./victory-screen";
import { XPToast } from "./xp-toast";
import { MAX_VISIBLE_TASKS } from "@/lib/constants";
import { useState, useCallback } from "react";

export function QuestBoard() {
  const todayTasks = useTaskStore((s) => s.todayTasks());
  const focusTask = useTaskStore((s) => s.focusTask());
  const [xpToast, setXPToast] = useState<{ amount: number; key: number } | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);

  const handleTaskComplete = useCallback((xpEarned: number) => {
    setXPToast({ amount: xpEarned, key: Date.now() });
    setCompletedToday((prev) => prev + 1);

    // Check if all tasks are done after this completion
    const remaining = useTaskStore.getState().todayTasks();
    if (remaining.length === 0) {
      setTimeout(() => setShowVictory(true), 600);
    }
  }, []);

  const queueTasks = todayTasks.filter((t) => !t.is_focus);
  const visibleQueue = queueTasks.slice(0, MAX_VISIBLE_TASKS - 1);
  const overflowCount = Math.max(0, queueTasks.length - visibleQueue.length);

  // Empty state
  if (todayTasks.length === 0 && completedToday === 0) {
    return (
      <div className="py-16 text-center">
        <p
          className="text-2xl mb-2 font-display"
        >
          Dobry dzien na start
        </p>
        <p className="text-foreground-secondary text-sm mb-8">
          Dodaj pierwsze zadanie
        </p>
        <QuickAdd autoFocus />
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Focus Task */}
      {focusTask && (
        <FocusTask task={focusTask} onComplete={handleTaskComplete} />
      )}

      {/* Task Queue */}
      {visibleQueue.length > 0 && (
        <TaskQueue tasks={visibleQueue} onComplete={handleTaskComplete} />
      )}

      {/* Overflow indicator */}
      {overflowCount > 0 && (
        <p className="text-center text-sm text-foreground-secondary mt-3">
          i jeszcze {overflowCount} {overflowCount === 1 ? "zadanie" : "zadan"} w kolejce
        </p>
      )}

      {/* Quick Add */}
      <div className="mt-6">
        <QuickAdd />
      </div>

      {/* Daily Summary Bar */}
      <DailySummaryBar completedToday={completedToday} />

      {/* XP Toast */}
      {xpToast && <XPToast amount={xpToast.amount} key={xpToast.key} />}

      {/* Victory Screen */}
      {showVictory && (
        <VictoryScreen
          xpEarned={completedToday * 25}
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  );
}
