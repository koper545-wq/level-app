"use client";

import Link from "next/link";
import type { Area } from "@/types";

interface Props {
  area: Area;
  pendingCount: number;
  completedThisWeek: number;
}

export function AreaCard({ area, pendingCount, completedThisWeek }: Props) {
  return (
    <Link href={`/areas/${area.id}`}>
      <div className="bg-surface border border-border rounded-card p-4 hover:border-foreground-secondary/30 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: area.color }}
          />
          <h3 className="text-sm font-medium">{area.name}</h3>
        </div>

        <div className="flex items-center gap-4 text-xs text-foreground-secondary">
          <span>
            {pendingCount} {pendingCount === 1 ? "zadanie" : "zadan"}
          </span>
          <span>
            {completedThisWeek} ten tydzien
          </span>
        </div>
      </div>
    </Link>
  );
}
