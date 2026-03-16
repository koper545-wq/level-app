"use client";

import { useMemo } from "react";
import type { Task, Area } from "@/types";

interface Props {
  completedTasks: Task[];
  areas: Area[];
}

export function AreaBreakdown({ completedTasks, areas }: Props) {
  const breakdown = useMemo(() => {
    const counts = new Map<string, number>();
    completedTasks.forEach((t) => {
      const areaId = t.area_id || "none";
      counts.set(areaId, (counts.get(areaId) || 0) + 1);
    });

    const total = completedTasks.length || 1;

    return areas
      .map((area) => ({
        name: area.name,
        color: area.color,
        count: counts.get(area.id) || 0,
        percent: Math.round(((counts.get(area.id) || 0) / total) * 100),
      }))
      .filter((a) => a.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [completedTasks, areas]);

  if (breakdown.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium mb-3">
        Ukonczenia wg obszaru (30 dni)
      </p>
      <div className="bg-surface border border-border rounded-card p-4 space-y-3">
        {breakdown.map((area) => (
          <div key={area.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                <span className="text-xs">{area.name}</span>
              </div>
              <span className="text-xs font-mono text-foreground-secondary">
                {area.count} ({area.percent}%)
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${area.percent}%`,
                  backgroundColor: area.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
