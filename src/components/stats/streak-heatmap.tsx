"use client";

import { useMemo } from "react";
import type { StreakLogEntry } from "@/types";

interface Props {
  streakLog: StreakLogEntry[];
}

export function StreakHeatmap({ streakLog }: Props) {
  const days = useMemo(() => {
    const result: { date: string; active: boolean; shieldUsed: boolean }[] = [];
    const now = new Date();

    const logMap = new Map<string, StreakLogEntry>();
    streakLog.forEach((l) => logMap.set(l.date, l));

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = logMap.get(dateStr);
      result.push({
        date: dateStr,
        active: log?.was_active ?? false,
        shieldUsed: log?.shield_used ?? false,
      });
    }

    return result;
  }, [streakLog]);

  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium mb-3">
        Aktywnosc (30 dni)
      </p>
      <div className="bg-surface border border-border rounded-card p-4">
        <div className="grid grid-cols-10 gap-1.5">
          {days.map((day) => (
            <div
              key={day.date}
              className="aspect-square rounded-sm transition-colors"
              style={{
                backgroundColor: day.active
                  ? "#3D4FE0"
                  : day.shieldUsed
                  ? "#C49A1A"
                  : "var(--color-border)",
                opacity: day.active ? 1 : day.shieldUsed ? 0.6 : 0.3,
              }}
              title={`${day.date}${day.active ? " — aktywny" : day.shieldUsed ? " — tarcza" : ""}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#3D4FE0" }} />
            <span className="text-[10px] text-foreground-secondary">Aktywny</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#C49A1A", opacity: 0.6 }} />
            <span className="text-[10px] text-foreground-secondary">Tarcza</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "var(--color-border)", opacity: 0.3 }} />
            <span className="text-[10px] text-foreground-secondary">Nieaktywny</span>
          </div>
        </div>
      </div>
    </div>
  );
}
