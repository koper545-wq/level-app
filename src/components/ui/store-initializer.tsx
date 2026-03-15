"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/stores/user-store";
import { useAreaStore } from "@/stores/area-store";
import { useTaskStore } from "@/stores/task-store";
import type { User, Area, Task } from "@/types";

interface Props {
  user: User | null;
  areas: Area[];
  tasks: Task[];
}

export function StoreInitializer({ user, areas, tasks }: Props) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      if (user) useUserStore.getState().setUser(user);
      useAreaStore.getState().setAreas(areas);
      useTaskStore.getState().setTasks(tasks);
      initialized.current = true;
    }
  }, [user, areas, tasks]);

  return null;
}
