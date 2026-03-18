"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/stores/session-store";
import { useTaskStore } from "@/stores/task-store";
import { TaskCard } from "./task-card";
import { XPToast } from "./xp-toast";
import { handleTaskCompletion } from "@/lib/complete-task";
import type { Task } from "@/types";

export function SessionMode() {
  const tasks = useTaskStore((s) => s.tasks);
  const selectedTaskIds = useSessionStore((s) => s.selectedTaskIds);
  const startedAt = useSessionStore((s) => s.startedAt);
  const duration = useSessionStore((s) => s.duration);
  const completedInSession = useSessionStore((s) => s.completedInSession);
  const recordCompletion = useSessionStore((s) => s.recordCompletion);
  const endSession = useSessionStore((s) => s.endSession);

  const [timeLeft, setTimeLeft] = useState(duration);
  const [xpToast, setXPToast] = useState<{ amount: number; key: number } | null>(null);

  // Timer
  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        endSession();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, duration, endSession]);

  const sessionTasks = tasks.filter(
    (t) => selectedTaskIds.includes(t.id) && t.status === "pending"
  );

  const totalSelected = selectedTaskIds.length;

  const handleComplete = useCallback(
    async (task: Task) => {
      const result = await handleTaskCompletion(task);
      if (result) {
        recordCompletion(result.xpEarned);
        setXPToast({ amount: result.xpEarned, key: Date.now() });
      }
      // If all tasks done, end session
      const remaining = useTaskStore
        .getState()
        .tasks.filter(
          (t) => selectedTaskIds.includes(t.id) && t.status === "pending"
        );
      // remaining includes the just-completed one until next render, so check <= 1
      if (remaining.length <= 1) {
        setTimeout(() => endSession(), 600);
      }
    },
    [selectedTaskIds, recordCompletion, endSession]
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Color changes as time runs low
  const timerColor =
    timeLeft <= 60
      ? "text-red-500"
      : timeLeft <= 300
        ? "text-amber-500"
        : "text-foreground";

  return (
    <div className="pb-8">
      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-6"
      >
        <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mb-1">
          Sesja
        </p>
        <p className={`text-5xl font-mono font-bold tabular-nums ${timerColor}`}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
        <p className="text-xs text-foreground-secondary mt-2">
          {completedInSession} / {totalSelected} zadan
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="h-1 bg-border rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: `${totalSelected > 0 ? (completedInSession / totalSelected) * 100 : 0}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {sessionTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            variant="queue"
            onComplete={() => handleComplete(task)}
          />
        ))}
      </div>

      {sessionTasks.length === 0 && (
        <p className="text-center text-sm text-foreground-secondary py-8">
          Wszystkie zadania ukonczone!
        </p>
      )}

      {/* End button */}
      <button
        onClick={endSession}
        className="w-full mt-6 py-3 rounded-xl text-sm font-medium border border-border text-foreground-secondary hover:text-foreground hover:border-foreground/30 transition-all"
      >
        Zakoncz sesje
      </button>

      {/* XP Toast */}
      {xpToast && <XPToast amount={xpToast.amount} key={xpToast.key} />}
    </div>
  );
}
