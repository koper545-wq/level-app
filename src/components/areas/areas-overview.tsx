"use client";

import { useState } from "react";
import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";
import { AreaCard } from "./area-card";
import { BalanceView } from "./balance-view";

export function AreasOverview() {
  const areas = useAreaStore((s) => s.areas);
  const tasks = useTaskStore((s) => s.tasks);
  const [tab, setTab] = useState<"areas" | "balance">("areas");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display">Obszary</h2>

        <div className="flex gap-1 bg-surface border border-border rounded-card p-0.5">
          <button
            onClick={() => setTab("areas")}
            className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${
              tab === "areas"
                ? "bg-foreground text-background"
                : "text-foreground-secondary"
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setTab("balance")}
            className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${
              tab === "balance"
                ? "bg-foreground text-background"
                : "text-foreground-secondary"
            }`}
          >
            Balance
          </button>
        </div>
      </div>

      {tab === "balance" ? (
        <BalanceView />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {areas
            .filter((a) => a.is_active)
            .map((area) => {
              const areaTasks = tasks.filter(
                (t) => t.area_id === area.id && t.status === "pending"
              );
              const completedThisWeek = tasks.filter((t) => {
                if (t.area_id !== area.id || t.status !== "done") return false;
                const completed = t.completed_at
                  ? new Date(t.completed_at)
                  : null;
                if (!completed) return false;
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return completed >= weekAgo;
              }).length;

              return (
                <AreaCard
                  key={area.id}
                  area={area}
                  pendingCount={areaTasks.length}
                  completedThisWeek={completedThisWeek}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
