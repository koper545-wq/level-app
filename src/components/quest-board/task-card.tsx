"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types";
import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";

interface Props {
  task: Task;
  variant?: "focus" | "queue";
  onComplete: () => void;
}

export function TaskCard({ task, variant = "queue", onComplete }: Props) {
  const area = task.area || useAreaStore.getState().getAreaById(task.area_id || "");
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const rescheduleTask = useTaskStore((s) => s.rescheduleTask);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask);
  const [confirming, setConfirming] = useState(false);
  const [showPostpone, setShowPostpone] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (confirming) {
      timerRef.current = setTimeout(() => setConfirming(false), 2500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [confirming]);

  function handleClick() {
    if (confirming) {
      setConfirming(false);
      onComplete();
    } else {
      setConfirming(true);
    }
  }

  function handlePostpone() {
    postponeTask(task.id);
    setShowPostpone(false);
  }

  // Count subtasks progress
  const subtasksDone = task.subtasks?.filter((s) => s.is_done).length ?? 0;
  const subtasksTotal = task.subtasks?.length ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.15 } }}
      className={`
        bg-surface border border-border rounded-card overflow-hidden
        ${variant === "focus" ? "ring-1 ring-accent/20" : ""}
      `}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox — two-tap to complete */}
        <button
          onClick={handleClick}
          className={`
            flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center
            ${
              confirming
                ? "border-success bg-success/20 scale-110"
                : variant === "focus"
                ? "border-accent hover:border-accent hover:bg-accent/10 active:bg-accent/20"
                : "border-border hover:border-accent active:bg-accent/20"
            }
          `}
          aria-label={confirming ? "Potwierdz ukonczone" : "Ukoncz zadanie"}
        >
          {confirming && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {task.recurrence_rule && !confirming && (
              <span className="text-[10px] text-foreground-secondary" title="Powtarzajace">♻️</span>
            )}
            <p className={`text-sm truncate ${variant === "focus" ? "font-medium" : ""}`}>
              {confirming ? (
                <span className="text-success font-medium">Kliknij ponownie</span>
              ) : (
                task.title
              )}
            </p>
          </div>
          {subtasksTotal > 0 && !confirming && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-foreground-secondary font-mono">{subtasksDone}/{subtasksTotal}</span>
            </div>
          )}
        </div>

        {/* Area chip */}
        {area && !confirming && (
          <span
            className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: area.color }}
          >
            {area.name}
          </span>
        )}

        {/* XP badge */}
        {!confirming && (
          <span className="flex-shrink-0 text-xs font-mono text-foreground-secondary">
            +{task.xp_value}
          </span>
        )}

        {/* Postpone button */}
        {!confirming && (
          <button
            onClick={() => setShowPostpone(!showPostpone)}
            className="flex-shrink-0 p-1 text-foreground-secondary hover:text-foreground transition-colors"
            aria-label="Przesun zadanie"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Postpone options */}
      <AnimatePresence>
        {showPostpone && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              <button
                onClick={handlePostpone}
                className="text-[11px] px-3 py-1.5 rounded-full bg-foreground text-background min-h-[32px]"
              >
                Jutro
              </button>
              <button
                onClick={() => {
                  setTimeout(() => dateRef.current?.showPicker(), 50);
                }}
                className="text-[11px] px-3 py-1.5 rounded-full border border-border text-foreground-secondary min-h-[32px]"
              >
                Wybierz dzien
              </button>
              <button
                onClick={() => {
                  rescheduleTask(task.id, null);
                  setShowPostpone(false);
                }}
                className="text-[11px] px-3 py-1.5 rounded-full border border-border text-foreground-secondary min-h-[32px]"
              >
                TBD
              </button>
              <input
                ref={dateRef}
                type="date"
                min={today}
                onChange={(e) => {
                  if (e.target.value) {
                    rescheduleTask(task.id, e.target.value);
                    setShowPostpone(false);
                  }
                }}
                className="sr-only"
                tabIndex={-1}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtask expand toggle */}
      {!confirming && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-1.5 text-[10px] text-foreground-secondary hover:text-foreground border-t border-border transition-colors flex items-center justify-center gap-1"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {subtasksTotal > 0 ? `Podzadania (${subtasksDone}/${subtasksTotal})` : "Dodaj podzadania"}
        </button>
      )}

      {/* Subtask list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1">
              {task.subtasks?.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleSubtask(task.id, sub.id)}
                    className={`flex-shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      sub.is_done
                        ? "border-success bg-success text-white"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    {sub.is_done && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-xs flex-1 ${sub.is_done ? "line-through text-foreground-secondary" : ""}`}>
                    {sub.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask(task.id, sub.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-foreground-secondary/30 hover:text-red-500 transition-all"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newSubtask.trim()) return;
                  addSubtask(task.id, newSubtask.trim());
                  setNewSubtask("");
                }}
                className="flex items-center gap-2 pt-1"
              >
                <span className="text-foreground-secondary text-xs">+</span>
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Dodaj podzadanie..."
                  className="flex-1 text-xs bg-transparent placeholder:text-foreground-secondary/50 focus:outline-none"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
