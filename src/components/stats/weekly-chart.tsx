"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { XPLogEntry } from "@/types";

interface Props {
  xpLog: XPLogEntry[];
}

export function WeeklyChart({ xpLog }: Props) {
  const data = useMemo(() => {
    const days: { name: string; date: string; xp: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("pl-PL", { weekday: "short" });

      const dayXP = xpLog
        .filter((l) => l.created_at.startsWith(dateStr))
        .reduce((sum, l) => sum + l.amount, 0);

      days.push({ name: dayName, date: dateStr, xp: dayXP });
    }

    return days;
  }, [xpLog]);

  const maxXP = Math.max(...data.map((d) => d.xp), 10);

  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium mb-3">
        XP ostatnie 7 dni
      </p>
      <div className="bg-surface border border-border rounded-card p-4">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9B9B9B" }}
            />
            <YAxis hide domain={[0, maxXP * 1.2]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value} XP`, "XP"]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => String(label)}
            />
            <Bar dataKey="xp" fill="#3D4FE0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
