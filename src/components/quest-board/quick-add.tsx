"use client";

import { useState, useRef } from "react";
import { useTaskStore } from "@/stores/task-store";
import { useAreaStore } from "@/stores/area-store";
import type { TaskDifficulty } from "@/types";
import { DIFFICULTY_LABELS } from "@/lib/constants";

function getDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (dateStr === today) return "Dzisiaj";
  if (dateStr === tomorrowStr) return "Jutro";

  const d = new Date(dateStr + "T00:00:00");
  const dayNames = ["Nd", "Pn", "Wt", "Sr", "Cz", "Pt", "Sb"];
  return `${dayNames[d.getDay()]} ${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface Props {
  autoFocus?: boolean;
  defaultAreaId?: string | null;
}

export function QuickAdd({ autoFocus, defaultAreaId }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState<string | null>(defaultAreaId ?? null);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>("medium");
  const [scheduledDate, setScheduledDate] = useState<string | null>(today);
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore((s) => s.addTask);
  const areas = useAreaStore((s) => s.areas);

  const tomorrowDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = await addTask({
      title: title.trim(),
      area_id: areaId,
      difficulty,
      scheduled_date: scheduledDate ?? undefined,
    });

    // Set recurrence on the created task
    if (newTask && recurrence) {
      const { useTaskStore: ts } = await import("@/stores/task-store");
      ts.getState().updateTask(newTask.id, { recurrence_rule: recurrence });
    }

    setTitle("");
    setAreaId(defaultAreaId ?? null);
    setDifficulty("medium");
    setScheduledDate(today);
    setRecurrence(null);
    setExpanded(false);
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-accent text-lg">+</span>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Dodaj zadanie..."
          autoFocus={autoFocus}
          className="flex-1 bg-transparent text-sm placeholder:text-foreground-secondary focus:outline-none py-2"
        />
        {title.trim() && (
          <button
            type="submit"
            className="text-xs bg-accent text-white px-4 py-2 rounded-card font-medium hover:opacity-90 transition-opacity"
          >
            Dodaj
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-2 pl-6">
          {/* Date selector */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScheduledDate(today)}
              className={`text-[11px] px-3 py-1.5 rounded-full transition-colors min-h-[36px] ${
                scheduledDate === today
                  ? "bg-foreground text-background"
                  : "text-foreground-secondary border border-border"
              }`}
            >
              Dzisiaj
            </button>
            <button
              type="button"
              onClick={() => setScheduledDate(tomorrowDate)}
              className={`text-[11px] px-3 py-1.5 rounded-full transition-colors min-h-[36px] ${
                scheduledDate === tomorrowDate
                  ? "bg-foreground text-background"
                  : "text-foreground-secondary border border-border"
              }`}
            >
              Jutro
            </button>
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker()}
              className={`text-[11px] px-3 py-1.5 rounded-full transition-colors min-h-[36px] ${
                scheduledDate !== null && scheduledDate !== today && scheduledDate !== tomorrowDate
                  ? "bg-foreground text-background"
                  : "text-foreground-secondary border border-border"
              }`}
            >
              {scheduledDate !== null && scheduledDate !== today && scheduledDate !== tomorrowDate
                ? getDateLabel(scheduledDate)
                : "Wybierz dzien"}
            </button>
            <button
              type="button"
              onClick={() => setScheduledDate(null)}
              className={`text-[11px] px-3 py-1.5 rounded-full transition-colors min-h-[36px] ${
                scheduledDate === null
                  ? "bg-foreground text-background"
                  : "text-foreground-secondary border border-border"
              }`}
            >
              TBD
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={scheduledDate ?? ""}
              min={today}
              onChange={(e) => {
                if (e.target.value) setScheduledDate(e.target.value);
              }}
              className="sr-only"
              tabIndex={-1}
            />
          </div>

          {/* Area chips */}
          {!defaultAreaId && (
            <div className="flex flex-wrap gap-2">
              {areas.filter((a) => a.is_active).map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setAreaId(areaId === area.id ? null : area.id)}
                  className={`
                    text-[11px] px-3 py-1.5 rounded-full transition-all min-h-[36px]
                    ${
                      areaId === area.id
                        ? "text-white"
                        : "text-foreground-secondary border border-border hover:border-foreground-secondary"
                    }
                  `}
                  style={areaId === area.id ? { backgroundColor: area.color } : {}}
                >
                  {area.name}
                </button>
              ))}
            </div>
          )}

          {/* Difficulty */}
          <div className="flex gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`
                  text-[11px] px-3 py-1.5 rounded-full transition-colors min-h-[36px]
                  ${
                    difficulty === d
                      ? "bg-foreground text-background"
                      : "text-foreground-secondary border border-border"
                  }
                `}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>

          {/* Recurrence */}
          <div className="flex flex-wrap gap-2">
            {([
              { value: null, label: "Jednorazowo" },
              { value: "daily", label: "Codziennie" },
              { value: "weekdays", label: "Dni robocze" },
              { value: "weekly:pn,sr,pt", label: "3x/tydzien" },
            ] as { value: string | null; label: string }[]).map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => setRecurrence(r.value)}
                className={`text-[11px] px-3 py-1.5 rounded-full transition-colors min-h-[36px] ${
                  recurrence === r.value
                    ? "bg-foreground text-background"
                    : "text-foreground-secondary border border-border"
                }`}
              >
                {r.value && "♻️ "}{r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
