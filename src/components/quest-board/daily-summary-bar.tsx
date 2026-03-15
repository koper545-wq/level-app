"use client";

import { useUserStore } from "@/stores/user-store";
import { useAreaStore } from "@/stores/area-store";
import { getXPProgress } from "@/lib/xp";

interface Props {
  completedToday: number;
}

export function DailySummaryBar({ completedToday }: Props) {
  const user = useUserStore((s) => s.user);
  const areas = useAreaStore((s) => s.areas);

  if (!user) return null;

  const { currentLevel, progressPercent } = getXPProgress(user.xp_total);

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-surface/80 backdrop-blur-sm border-t border-border md:bottom-0 z-40">
      <div className="max-w-content mx-auto px-4 py-2 flex items-center justify-between text-xs">
        {/* XP today */}
        <div className="flex items-center gap-1.5">
          <span className="text-foreground-secondary">Dzis:</span>
          <span className="font-mono font-medium text-accent">
            {completedToday} done
          </span>
        </div>

        {/* Level progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-foreground-secondary font-mono">
            LVL {currentLevel}
          </span>
          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Area mini-dots */}
        <div className="flex items-center gap-1">
          {areas.slice(0, 7).map((area) => (
            <div
              key={area.id}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: area.color, opacity: 0.6 }}
              title={area.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
