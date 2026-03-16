"use client";

import { useState, useRef } from "react";
import { useTaskStore } from "@/stores/task-store";
import { useAreaStore } from "@/stores/area-store";
import type { Task } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

function daysAgo(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + "T00:00:00");
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 1) return "wczoraj";
  if (diff < 7) return `${diff} dni temu`;
  return `${Math.floor(diff / 7)} tyg. temu`;
}

interface OverdueTaskItemProps {
  task: Task;
}

function OverdueTaskItem({ task }: OverdueTaskItemProps) {
  const rescheduleTask = useTaskStore((s) => s.rescheduleTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const area = useAreaStore.getState().getAreaById(task.area_id || "");
  const [showOptions, setShowOptions] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  function handleReschedule(date: string) {
    rescheduleTask(task.id, date);
    setShowOptions(false);
  }

  function handleComplete() {
    completeTask(task.id);
    setShowOptions(false);
  }

  function handleDelete() {
    deleteTask(task.id);
    setShowOptions(false);
  }

  return (
    <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-card overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => setShowOptions(!showOptions)}
      >
        {/* Warning dot */}
        <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{task.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {area && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: area.color }}
              >
                {area.name}
              </span>
            )}
            <span className="text-[10px] text-foreground-secondary">
              {daysAgo(task.scheduled_date || "")}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-foreground-secondary transition-transform ${showOptions ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Reschedule options */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">
                Przenies na:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleReschedule(today)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-accent text-white min-h-[36px] font-medium"
                >
                  Dzisiaj
                </button>
                <button
                  onClick={() => handleReschedule(tomorrow)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-border text-foreground-secondary min-h-[36px]"
                >
                  Jutro
                </button>
                <button
                  onClick={() => {
                    setTimeout(() => dateInputRef.current?.showPicker(), 50);
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-border text-foreground-secondary min-h-[36px]"
                >
                  Wybierz dzien
                </button>
                <input
                  ref={dateInputRef}
                  type="date"
                  min={today}
                  onChange={(e) => {
                    if (e.target.value) handleReschedule(e.target.value);
                  }}
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleComplete}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-success/30 text-success min-h-[36px]"
                >
                  Ukoncz
                </button>
                <button
                  onClick={handleDelete}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-red-500/30 text-red-500 min-h-[36px]"
                >
                  Usun
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Props {
  tasks: Task[];
}

export function OverdueTasks({ tasks }: Props) {
  const rescheduleTask = useTaskStore((s) => s.rescheduleTask);
  const today = new Date().toISOString().split("T")[0];

  if (tasks.length === 0) return null;

  function moveAllToToday() {
    tasks.forEach((t) => rescheduleTask(t.id, today));
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wider text-yellow-600 font-medium">
          Zaległe ({tasks.length})
        </p>
        {tasks.length > 1 && (
          <button
            onClick={moveAllToToday}
            className="text-[10px] text-accent font-medium"
          >
            Przenies wszystko na dzisiaj
          </button>
        )}
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <OverdueTaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
