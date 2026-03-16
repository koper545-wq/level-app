"use client";

import type { Task, XPLogEntry, User } from "@/types";

interface Props {
  profile: User | null;
  completedTasks: Task[];
  xpLog: XPLogEntry[];
}

export function StatsSummary({ profile, completedTasks, xpLog }: Props) {
  const totalCompleted = completedTasks.length;
  const totalXP = xpLog.reduce((sum, l) => sum + l.amount, 0);

  // Average tasks per day (last 30 days)
  const avgPerDay = totalCompleted > 0 ? (totalCompleted / 30).toFixed(1) : "0";

  // Best day
  const dayMap = new Map<string, number>();
  completedTasks.forEach((t) => {
    if (t.completed_at) {
      const day = t.completed_at.split("T")[0];
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }
  });
  const bestDay = dayMap.size > 0
    ? Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1])[0]
    : null;

  const stats = [
    { label: "Ukonczone zadania", value: totalCompleted.toString() },
    { label: "XP zdobyte", value: totalXP.toString() },
    { label: "Srednia / dzien", value: avgPerDay },
    {
      label: "Najlepszy dzien",
      value: bestDay
        ? `${bestDay[1]} zadan`
        : "-",
    },
    { label: "Aktualny streak", value: profile?.streak_current?.toString() ?? "0" },
    { label: "Najdluzszy streak", value: profile?.streak_longest?.toString() ?? "0" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface border border-border rounded-card p-3"
        >
          <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">
            {stat.label}
          </p>
          <p className="text-xl font-mono font-medium mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
