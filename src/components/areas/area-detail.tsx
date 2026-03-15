"use client";

import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";
import Link from "next/link";

interface Props {
  areaId: string;
}

export function AreaDetail({ areaId }: Props) {
  const area = useAreaStore((s) => s.getAreaById(areaId));
  const tasks = useTaskStore((s) => s.tasks);

  if (!area) {
    return (
      <div className="py-16 text-center text-foreground-secondary">
        Obszar nie znaleziony
      </div>
    );
  }

  const pendingTasks = tasks.filter(
    (t) => t.area_id === areaId && t.status === "pending"
  );

  return (
    <div>
      <Link
        href="/areas"
        className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
      >
        &larr; Obszary
      </Link>

      <div className="flex items-center gap-3 mt-4 mb-6">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: area.color }}
        />
        <h2
          className="text-2xl font-display"
        >
          {area.name}
        </h2>
      </div>

      {pendingTasks.length === 0 ? (
        <p className="text-sm text-foreground-secondary">
          Brak aktywnych zadan w tym obszarze
        </p>
      ) : (
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-surface border border-border rounded-card"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: area.color }}
              />
              <span className="text-sm flex-1">{task.title}</span>
              <span className="text-xs font-mono text-foreground-secondary">
                +{task.xp_value} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
