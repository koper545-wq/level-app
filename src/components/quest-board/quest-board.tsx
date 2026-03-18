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
import { useSessionStore } from "@/stores/session-store";
import { SessionSelector } from "./session-selector";
import { SessionMode } from "./session-mode";
import { SessionSummary } from "./session-summary";
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
  const [showAllQueue, setShowAllQueue] = useState(false);
  const tryTriggerBonus = useBonusQuestStore((s) => s.tryTrigger);
  const sessionPhase = useSessionStore((s) => s.phase);
  const selectedTaskIds = useSessionStore((s) => s.selectedTaskIds);
  const toggleTask = useSessionStore((s) => s.toggleTask);
  const startSelecting = useSessionStore((s) => s.startSelecting);
  const isSelecting = sessionPhase === "selecting";

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

  // Session active — show only session view
  if (sessionPhase === "active") {
    return <SessionMode />;
  }

  // Session summary
  if (sessionPhase === "summary") {
    return <SessionSummary />;
  }

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
      {/* Session Selector */}
      {isSelecting && <SessionSelector />}

      {/* Bonus Quest Banner */}
      {!isSelecting && <BonusQuestBanner />}

      {/* Overdue tasks */}
      {!isSelecting && <OverdueTasks tasks={overdueTasks} />}

      {/* Focus Task */}
      {focusTask && (
        <FocusTask
          task={focusTask}
          onComplete={handleTaskComplete}
          selectable={isSelecting}
          selected={selectedTaskIds.includes(focusTask.id)}
          onSelect={() => toggleTask(focusTask.id)}
        />
      )}

      {/* Task Queue — show all tasks when selecting */}
      {(isSelecting ? queueTasks : showAllQueue ? queueTasks : visibleQueue).length > 0 && (
        <TaskQueue
          tasks={isSelecting ? queueTasks : showAllQueue ? queueTasks : visibleQueue}
          onComplete={handleTaskComplete}
          selectable={isSelecting}
          selectedIds={selectedTaskIds}
          onSelect={toggleTask}
        />
      )}

      {/* Overflow indicator / toggle */}
      {!isSelecting && overflowCount > 0 && (
        <button
          onClick={() => setShowAllQueue(!showAllQueue)}
          className="w-full text-center text-sm text-foreground-secondary mt-3 hover:text-foreground transition-colors flex items-center justify-center gap-1"
        >
          {showAllQueue ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Zwiń kolejke
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              i jeszcze {overflowCount} {overflowCount === 1 ? "zadanie" : "zadan"} w kolejce
            </>
          )}
        </button>
      )}

      {/* Session start button (when not selecting) */}
      {!isSelecting && todayTasks.length >= 2 && (
        <button
          onClick={startSelecting}
          className="w-full mt-4 py-2.5 rounded-xl text-xs font-medium border border-accent/30 text-accent hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          Tryb sesji
        </button>
      )}

      {/* Quick Add */}
      {!isSelecting && (
        <div className="mt-6">
          <QuickAdd />
        </div>
      )}

      {/* Backlog / TBD tasks */}
      {!isSelecting && <BacklogTasks tasks={backlogTasks} onComplete={handleTaskComplete} />}

      {/* Habits */}
      {!isSelecting && <HabitList />}

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
