"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";
import { useAreaStore } from "@/stores/area-store";

interface DayColumnProps {
  date: string;
  label: string;
  isToday: boolean;
  tasks: Task[];
}

function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const area = useAreaStore.getState().getAreaById(task.area_id || "");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 py-1.5 px-2 bg-background rounded-md cursor-grab active:cursor-grabbing"
    >
      {area && (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: area.color }}
        />
      )}
      <span className="text-xs truncate flex-1">{task.title}</span>
      <span className="text-[10px] font-mono text-foreground-secondary">
        +{task.xp_value}
      </span>
    </div>
  );
}

export function DayColumn({ date, label, isToday, tasks }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: date });

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-card p-3 transition-colors ${
        isToday
          ? "border-accent/30 bg-accent/5"
          : isOver
          ? "border-accent/20 bg-accent/5"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-medium ${
            isToday ? "text-accent" : "text-foreground-secondary"
          }`}
        >
          {label}
        </span>
        {tasks.length > 0 && (
          <span className="text-[10px] text-foreground-secondary font-mono">
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-1">
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-foreground-secondary/50 py-1">
          {isOver ? "Upusc tutaj" : "Brak zadan"}
        </p>
      )}
    </div>
  );
}
