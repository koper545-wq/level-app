"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/stores/user-store";
import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";
import { useGoalStore } from "@/stores/goal-store";
import { useHabitStore } from "@/stores/habit-store";
import type { User, Area, Task, Goal, Habit, HabitLog } from "@/types";

interface Props {
  user: User | null;
  areas: Area[];
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  habitLog: HabitLog[];
}

export function StoreInitializer({ user, areas, tasks, goals, habits, habitLog }: Props) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      if (user) useUserStore.getState().setUser(user);
      useAreaStore.getState().setAreas(areas);
      useTaskStore.getState().setTasks(tasks);
      useGoalStore.getState().setGoals(goals);
      useHabitStore.getState().setHabits(habits);
      useHabitStore.getState().setTodayLog(habitLog);
      initialized.current = true;
    }
  }, [user, areas, tasks, goals, habits, habitLog]);

  return null;
}
