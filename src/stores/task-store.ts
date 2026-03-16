import { create } from "zustand";
import type { Task, TaskDifficulty } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { XP_BY_DIFFICULTY } from "@/lib/constants";
import { coinsForXP } from "@/lib/constants";

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;

  addTask: (params: {
    title: string;
    area_id?: string | null;
    difficulty?: TaskDifficulty;
    scheduled_date?: string | null;
    parent_goal_id?: string | null;
    savings_amount?: number;
  }) => Promise<Task | null>;

  completeTask: (taskId: string) => Promise<Task | null>;
  postponeTask: (taskId: string) => void;
  rescheduleTask: (taskId: string, date: string | null) => void;
  setFocusTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;

  // Subtasks
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Computed
  todayTasks: () => Task[];
  overdueTasks: () => Task[];
  backlogTasks: () => Task[];
  focusTask: () => Task | undefined;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  setTasks: (tasks) => set({ tasks }),

  addTask: async ({ title, area_id, difficulty = "medium", scheduled_date, parent_goal_id, savings_amount }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().split("T")[0];
    const xpValue = XP_BY_DIFFICULTY[difficulty];
    const coinsValue = coinsForXP(xpValue);

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title,
        area_id: area_id || null,
        difficulty,
        xp_value: xpValue,
        coins_value: coinsValue,
        scheduled_date: scheduled_date === undefined ? today : scheduled_date,
        parent_goal_id: parent_goal_id || null,
        savings_amount: savings_amount || 0,
        sort_order: get().tasks.length,
      })
      .select("*, area:areas(*)")
      .single();

    if (error || !task) return null;

    const currentTasks = get().tasks;
    // If no focus task exists, make this one focus
    const hasFocus = currentTasks.some((t) => t.is_focus);
    if (!hasFocus) {
      task.is_focus = true;
      await supabase.from("tasks").update({ is_focus: true }).eq("id", task.id);
    }

    set({ tasks: [...currentTasks, task] });
    return task;
  },

  completeTask: async (taskId) => {
    const tasks = get().tasks;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    // Optimistic update
    const updatedTasks = tasks.filter((t) => t.id !== taskId);

    // If this was the focus task, promote next one
    if (task.is_focus && updatedTasks.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const nextFocus = updatedTasks.find(
        (t) => t.status === "pending" && t.scheduled_date === today
      );
      if (nextFocus) {
        nextFocus.is_focus = true;
        const supabase = createClient();
        supabase.from("tasks").update({ is_focus: true }).eq("id", nextFocus.id).then();
      }
    }

    set({ tasks: updatedTasks });

    // Persist
    const supabase = createClient();
    await supabase
      .from("tasks")
      .update({
        status: "done",
        is_focus: false,
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    return task;
  },

  postponeTask: (taskId) => {
    const tasks = get().tasks;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    set({
      tasks: tasks.map((t) =>
        t.id === taskId
          ? { ...t, scheduled_date: tomorrowStr, is_focus: false }
          : t
      ),
    });

    const supabase = createClient();
    supabase
      .from("tasks")
      .update({ scheduled_date: tomorrowStr, is_focus: false })
      .eq("id", taskId)
      .then();
  },

  rescheduleTask: (taskId, date) => {
    const tasks = get().tasks;
    set({
      tasks: tasks.map((t) =>
        t.id === taskId
          ? { ...t, scheduled_date: date, is_focus: false }
          : t
      ),
    });

    const supabase = createClient();
    supabase
      .from("tasks")
      .update({ scheduled_date: date, is_focus: false })
      .eq("id", taskId)
      .then();
  },

  setFocusTask: (taskId) => {
    const tasks = get().tasks;
    set({
      tasks: tasks.map((t) => ({
        ...t,
        is_focus: t.id === taskId,
      })),
    });

    const supabase = createClient();
    // Unfocus all, then focus the target
    const userId = tasks[0]?.user_id;
    if (userId) {
      supabase
        .from("tasks")
        .update({ is_focus: false })
        .eq("user_id", userId)
        .eq("status", "pending")
        .then(() => {
          supabase
            .from("tasks")
            .update({ is_focus: true })
            .eq("id", taskId)
            .then();
        });
    }
  },

  deleteTask: (taskId) => {
    set({ tasks: get().tasks.filter((t) => t.id !== taskId) });

    const supabase = createClient();
    supabase.from("tasks").delete().eq("id", taskId).then();
  },

  updateTask: (taskId, updates) => {
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    });

    const supabase = createClient();
    supabase.from("tasks").update(updates).eq("id", taskId).then();
  },

  addSubtask: async (taskId, title) => {
    const supabase = createClient();
    const task = get().tasks.find((t) => t.id === taskId);
    const sortOrder = task?.subtasks?.length ?? 0;

    const { data: subtask } = await supabase
      .from("subtasks")
      .insert({ task_id: taskId, title, sort_order: sortOrder })
      .select()
      .single();

    if (subtask) {
      set({
        tasks: get().tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: [...(t.subtasks ?? []), subtask] }
            : t
        ),
      });
    }
  },

  toggleSubtask: (taskId, subtaskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    const subtask = task?.subtasks?.find((s) => s.id === subtaskId);
    if (!subtask) return;

    const newDone = !subtask.is_done;
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks?.map((s) =>
                s.id === subtaskId ? { ...s, is_done: newDone } : s
              ),
            }
          : t
      ),
    });

    const supabase = createClient();
    supabase.from("subtasks").update({ is_done: newDone }).eq("id", subtaskId).then();
  },

  deleteSubtask: (taskId, subtaskId) => {
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks?.filter((s) => s.id !== subtaskId) }
          : t
      ),
    });

    const supabase = createClient();
    supabase.from("subtasks").delete().eq("id", subtaskId).then();
  },

  todayTasks: () => {
    const today = new Date().toISOString().split("T")[0];
    return get()
      .tasks.filter(
        (t) => t.status === "pending" && t.scheduled_date === today
      )
      .sort((a, b) => {
        if (a.is_focus && !b.is_focus) return -1;
        if (!a.is_focus && b.is_focus) return 1;
        return a.sort_order - b.sort_order;
      });
  },

  overdueTasks: () => {
    const today = new Date().toISOString().split("T")[0];
    return get()
      .tasks.filter(
        (t) =>
          t.status === "pending" &&
          t.scheduled_date !== null &&
          t.scheduled_date < today
      )
      .sort((a, b) => (a.scheduled_date || "").localeCompare(b.scheduled_date || ""));
  },

  backlogTasks: () => {
    return get()
      .tasks.filter((t) => t.status === "pending" && t.scheduled_date === null)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  focusTask: () => get().tasks.find((t) => t.is_focus && t.status === "pending"),
}));
