"use client";

import { useUserStore } from "@/stores/user-store";

export function Header() {
  const user = useUserStore((s) => s.user);

  const today = new Date();
  const dayName = today.toLocaleDateString("pl-PL", { weekday: "long" });
  const dateStr = today.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
  });

  return (
    <header className="pt-6 pb-4 flex items-center justify-between">
      <div>
        <h1
          className="text-2xl capitalize font-display"
        >
          {dayName}
        </h1>
        <p className="text-sm text-foreground-secondary">{dateStr}</p>
      </div>

      <div className="flex items-center gap-3">
        {user && user.streak_current > 0 && (
          <div className="flex items-center gap-1 text-sm font-mono">
            <span className="text-warning">&#x1F525;</span>
            <span>{user.streak_current}</span>
          </div>
        )}

        {user && (
          <div className="flex items-center gap-1 bg-surface border border-border rounded-full px-3 py-1">
            <span className="text-xs text-foreground-secondary">LVL</span>
            <span className="text-sm font-mono font-medium">
              {user.level}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
