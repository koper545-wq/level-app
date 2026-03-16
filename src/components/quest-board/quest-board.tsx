"use client";

import { useTaskStore } from "@/stores/task-store";
import { FocusTask } from "./focus-task";
import { TaskQueue } from "./task-queue";
import { QuickAdd } from "./quick-add";
import { DailySummaryBar } from "./daily-summary-bar";
import { VictoryScreen } from "./victory-screen";
import { XPToast } from "./xp-toast";
import { OverdueTasks } from "./overdue-tasks";
import { BonusQuestBanner } from "./bonus-quest-banner";
import { HabitList } from "@/components/habits/habit-list";
import { BacklogTasks } from "./backlog-tasks";
import { MilestoneOverlay } from "@/components/ui/milestone-overlay";
import { MAX_VISIBLE_TASKS } from "@/lib/constants";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useBonusQuestStore } from "@/stores/bonus-quest-store";
import type { CompletionResult } from "@/lib/complete-task";

export function QuestBoard() {
  const tasks = useTaskStore((s) => s.tasks);

  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return tasks
      .filter((t) => t.status === "pending" && t.scheduled_date === today)
      .sort((a, b) => {
        if (a.is_focus && !b.is_focus) return -1;
        if (!a.is_focus && b.is_focus) return 1;
        return a.sort_order - b.sort_order;
      });
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return tasks
      .filter(
        (t) =>
          t.status === "pending" &&
          t.scheduled_date !== null &&
          t.scheduled_date < today
      )
      .sort((a, b) => (a.scheduled_date || "").localeCompare(b.scheduled_date || ""));
  }, [tasks]);

  const backlogTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === "pending" && t.scheduled_date === null)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [tasks]);

  const focusTask = useMemo(
    () => tasks.find((t) => t.is_focus && t.status === "pending"),
    [tasks]
  );
  const [xpToast, setXPToast] = useState<{ amount: number; key: number } | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [milestoneData, setMilestoneData] = useState<CompletionResult["milestone"]>(null);
  const tryTriggerBonus = useBonusQuestStore((s) => s.tryTrigger);

  // Try to trigger bonus quest on mount
  useEffect(() => {
    if (todayTasks.length >= 2) {
      tryTriggerBonus(todayTasks);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTaskComplete = useCallback(
    (xpEarned: number, milestone: CompletionResult["milestone"]) => {
      setXPToast({ amount: xpEarned, key: Date.now() });
      setCompletedToday((prev) => prev + 1);

      // Show milestone overlay if earned
      if (milestone) {
        setTimeout(() => setMilestoneData(milestone), 800);
      }

      // Check if all tasks are done after this completion
      const remaining = useTaskStore.getState().todayTasks();
      if (remaining.length === 0) {
        setTimeout(() => setShowVictory(true), milestone ? 3000 : 600);
      }
    },
    []
  );

  const queueTasks = todayTasks.filter((t) => !t.is_focus);
  const visibleQueue = queueTasks.slice(0, MAX_VISIBLE_TASKS - 1);
  const overflowCount = Math.max(0, queueTasks.length - visibleQueue.length);

  // Empty state (no tasks today AND no overdue)
  if (todayTasks.length === 0 && overdueTasks.length === 0 && completedToday === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-2xl mb-2 font-display">Dobry dzien na start</p>
        <p className="text-foreground-secondary text-sm mb-8">
          Dodaj pierwsze zadanie
        </p>
        <QuickAdd autoFocus />
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Bonus Quest Banner */}
      <BonusQuestBanner />

      {/* Overdue tasks */}
      <OverdueTasks tasks={overdueTasks} />

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

      {/* Backlog / TBD tasks */}
      <BacklogTasks tasks={backlogTasks} onComplete={handleTaskComplete} />

      {/* Habits */}
      <HabitList />

      {/* Daily Summary Bar */}
      <DailySummaryBar completedToday={completedToday} />

      {/* XP Toast */}
      {xpToast && <XPToast amount={xpToast.amount} key={xpToast.key} />}

      {/* Milestone Overlay */}
      <MilestoneOverlay
        show={!!milestoneData}
        type={milestoneData?.type || "streak"}
        title={milestoneData?.title || ""}
        subtitle={milestoneData?.subtitle || ""}
        xp={milestoneData?.xp}
        coins={milestoneData?.coins}
        onClose={() => setMilestoneData(null)}
      />

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
