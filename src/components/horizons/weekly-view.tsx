"use client";

import { useMemo } from "react";
import { useTaskStore } from "@/stores/task-store";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { DayColumn } from "./day-column";
import type { Task } from "@/types";

function getWeekDates(): { date: string; label: string; isToday: boolean }[] {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);

  const days = [];
  const dayNames = ["Pn", "Wt", "Sr", "Cz", "Pt", "Sb", "Nd"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      label: `${dayNames[i]} ${date.getDate()}`,
      isToday: dateStr === today.toISOString().split("T")[0],
    });
  }

  return days;
}

export function WeeklyView() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const weekDates = useMemo(() => getWeekDates(), []);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const targetDate = over.id as string;

    // Only update if dropped on a different date column
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.scheduled_date !== targetDate) {
      updateTask(taskId, { scheduled_date: targetDate });
    }
  }

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    weekDates.forEach((d) => {
      grouped[d.date] = tasks
        .filter((t) => t.scheduled_date === d.date && t.status === "pending")
        .sort((a, b) => a.sort_order - b.sort_order);
    });
    return grouped;
  }, [tasks, weekDates]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2">
        {weekDates.map((day) => (
          <DayColumn
            key={day.date}
            date={day.date}
            label={day.label}
            isToday={day.isToday}
            tasks={tasksByDate[day.date] || []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-surface border border-accent/30 rounded-card p-3 shadow-lg opacity-90">
            <span className="text-sm">{activeTask.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
