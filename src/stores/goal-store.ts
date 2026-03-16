import { create } from "zustand";
import type { Goal, GoalMilestone } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface GoalState {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;

  addGoal: (params: {
    title: string;
    area_id?: string | null;
    description?: string;
    target_date?: string;
    is_boss?: boolean;
    xp_bonus?: number;
  }) => Promise<Goal | null>;

  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  updateProgress: (goalId: string) => void;

  // Milestones
  addMilestone: (goalId: string, title: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;

  // Computed
  activeGoals: () => Goal[];
  bossQuest: () => Goal | undefined;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],

  setGoals: (goals) => set({ goals }),

  addGoal: async ({ title, area_id, description, target_date, is_boss = false, xp_bonus = 1000 }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title,
        area_id: area_id || null,
        description: description || null,
        target_date: target_date || null,
        is_boss,
        xp_bonus,
        status: "active",
      })
      .select("*, area:areas(*)")
      .single();

    if (error || !goal) return null;

    set({ goals: [...get().goals, goal] });
    return goal;
  },

  updateGoal: (goalId, updates) => {
    set({
      goals: get().goals.map((g) =>
        g.id === goalId ? { ...g, ...updates } : g
      ),
    });

    const supabase = createClient();
    supabase.from("goals").update(updates).eq("id", goalId).then();
  },

  deleteGoal: (goalId) => {
    set({ goals: get().goals.filter((g) => g.id !== goalId) });

    const supabase = createClient();
    supabase.from("goals").delete().eq("id", goalId).then();
  },

  updateProgress: (goalId) => {
    // Progress is calculated from completed subtasks
    const supabase = createClient();
    supabase
      .from("tasks")
      .select("status")
      .eq("parent_goal_id", goalId)
      .then(({ data: tasks }) => {
        if (!tasks || tasks.length === 0) return;
        const done = tasks.filter((t) => t.status === "done").length;
        const percent = Math.round((done / tasks.length) * 100);

        get().updateGoal(goalId, {
          progress_percent: percent,
          ...(percent >= 100
            ? { status: "completed" as const, completed_at: new Date().toISOString() }
            : {}),
        });
      });
  },

  addMilestone: (goalId, title) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return;
    const newMilestone: GoalMilestone = {
      id: crypto.randomUUID(),
      title,
      is_done: false,
      completed_at: null,
    };
    const milestones = [...(goal.milestones || []), newMilestone];
    set({
      goals: get().goals.map((g) =>
        g.id === goalId ? { ...g, milestones } : g
      ),
    });
    const supabase = createClient();
    supabase.from("goals").update({ milestones }).eq("id", goalId).then();
  },

  toggleMilestone: (goalId, milestoneId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return;
    const milestones = (goal.milestones || []).map((m) =>
      m.id === milestoneId
        ? { ...m, is_done: !m.is_done, completed_at: !m.is_done ? new Date().toISOString() : null }
        : m
    );
    set({
      goals: get().goals.map((g) =>
        g.id === goalId ? { ...g, milestones } : g
      ),
    });
    const supabase = createClient();
    supabase.from("goals").update({ milestones }).eq("id", goalId).then();
  },

  deleteMilestone: (goalId, milestoneId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return;
    const milestones = (goal.milestones || []).filter((m) => m.id !== milestoneId);
    set({
      goals: get().goals.map((g) =>
        g.id === goalId ? { ...g, milestones } : g
      ),
    });
    const supabase = createClient();
    supabase.from("goals").update({ milestones }).eq("id", goalId).then();
  },

  activeGoals: () =>
    get()
      .goals.filter((g) => g.status === "active")
      .sort((a, b) => {
        // Boss quest always first
        if (a.is_boss && !b.is_boss) return -1;
        if (!a.is_boss && b.is_boss) return 1;
        return 0;
      }),

  bossQuest: () => get().goals.find((g) => g.is_boss && g.status === "active"),
}));
