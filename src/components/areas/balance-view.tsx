"use client";

import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";
import { useMemo } from "react";
import { HealthBar } from "./health-bar";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

export function BalanceView() {
  const areas = useAreaStore((s) => s.areas);
  const tasks = useTaskStore((s) => s.tasks);

  const areaStats = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return areas
      .filter((a) => a.is_active)
      .map((area) => {
        const completedDates = new Set(
          tasks
            .filter(
              (t) =>
                t.area_id === area.id &&
                t.status === "done" &&
                t.completed_at &&
                new Date(t.completed_at) >= weekAgo
            )
            .map((t) => t.completed_at!.split("T")[0])
        );

        return {
          name: area.name,
          color: area.color,
          activeDays: completedDates.size,
          tasksCompleted: tasks.filter(
            (t) =>
              t.area_id === area.id &&
              t.status === "done" &&
              t.completed_at &&
              new Date(t.completed_at) >= weekAgo
          ).length,
        };
      });
  }, [areas, tasks]);

  const radarData = areaStats.map((s) => ({
    area: s.name.length > 8 ? s.name.slice(0, 8) + "." : s.name,
    value: s.activeDays,
    fullMark: 7,
  }));

  return (
    <div>
      <h3 className="text-lg font-display mb-4">Balance</h3>

      {/* Radar Chart */}
      <div className="bg-surface border border-border rounded-card p-4 mb-4">
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="area"
              tick={{ fontSize: 10, fill: "var(--foreground-secondary)" }}
            />
            <Radar
              dataKey="value"
              stroke="#3D4FE0"
              fill="#3D4FE0"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Health Bars */}
      <div className="space-y-2">
        {areaStats.map((stat) => (
          <HealthBar
            key={stat.name}
            color={stat.color}
            activeDays={stat.activeDays}
            name={stat.name}
          />
        ))}
      </div>
    </div>
  );
}
