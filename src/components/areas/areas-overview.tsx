"use client";

import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";
import { AreaCard } from "./area-card";

export function AreasOverview() {
  const areas = useAreaStore((s) => s.areas);
  const tasks = useTaskStore((s) => s.tasks);

  return (
    <div>
      <h2
        className="text-2xl mb-6 font-display"
      >
        Obszary
      </h2>

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
    </div>
  );
}
