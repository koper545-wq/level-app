"use client";

import { useState, useRef } from "react";
import { useTaskStore } from "@/stores/task-store";
import { useAreaStore } from "@/stores/area-store";
import type { TaskDifficulty } from "@/types";
import { DIFFICULTY_LABELS } from "@/lib/constants";

interface Props {
  autoFocus?: boolean;
}

export function QuickAdd({ autoFocus }: Props) {
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>("medium");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore((s) => s.addTask);
  const areas = useAreaStore((s) => s.areas);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask({
      title: title.trim(),
      area_id: areaId,
      difficulty,
    });

    setTitle("");
    setAreaId(null);
    setDifficulty("medium");
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
          className="flex-1 bg-transparent text-sm placeholder:text-foreground-secondary focus:outline-none"
        />
        {title.trim() && (
          <button
            type="submit"
            className="text-xs bg-accent text-white px-3 py-1.5 rounded-card font-medium hover:opacity-90 transition-opacity"
          >
            Dodaj
          </button>
        )}
      </div>

      {/* Area chips + difficulty selector */}
      {expanded && (
        <div className="space-y-2 pl-6">
          {/* Area chips */}
          <div className="flex flex-wrap gap-1.5">
            {areas.filter((a) => a.is_active).map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setAreaId(areaId === area.id ? null : area.id)}
                className={`
                  text-[10px] px-2 py-0.5 rounded-full transition-all
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

          {/* Difficulty */}
          <div className="flex gap-1.5">
            {(
              Object.keys(DIFFICULTY_LABELS) as TaskDifficulty[]
            ).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`
                  text-[10px] px-2 py-0.5 rounded-full transition-colors
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
        </div>
      )}
    </form>
  );
}
