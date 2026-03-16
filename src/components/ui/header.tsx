"use client";

import Link from "next/link";
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

        <Link
          href="/stats"
          className="p-2 text-foreground-secondary hover:text-foreground transition-colors"
          aria-label="Statystyki"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </Link>

        <Link
          href="/settings"
          className="p-2 -mr-2 text-foreground-secondary hover:text-foreground transition-colors"
          aria-label="Ustawienia"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
