import { create } from "zustand";
import type { Habit, HabitLog } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface HabitState {
  habits: Habit[];
  todayLog: HabitLog[];

  setHabits: (habits: Habit[]) => void;
  setTodayLog: (log: HabitLog[]) => void;

  addHabit: (params: {
    title: string;
    area_id?: string | null;
    frequency?: string;
  }) => Promise<Habit | null>;

  toggleHabit: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;

  isCompletedToday: (habitId: string) => boolean;
  todayHabits: () => Habit[];
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayLog: [],

  setHabits: (habits) => set({ habits }),
  setTodayLog: (log) => set({ todayLog: log }),

  addHabit: async ({ title, area_id, frequency = "daily" }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: habit, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        title,
        area_id: area_id || null,
        frequency,
        sort_order: get().habits.length,
      })
      .select("*, area:areas(*)")
      .single();

    if (error || !habit) return null;

    set({ habits: [...get().habits, habit] });
    return habit;
  },

  toggleHabit: async (habitId) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const existing = get().todayLog.find((l) => l.habit_id === habitId);

    if (existing) {
      // Un-complete
      set({ todayLog: get().todayLog.filter((l) => l.habit_id !== habitId) });
      supabase.from("habit_log").delete().eq("id", existing.id).then();

      // Decrement streak
      const habit = get().habits.find((h) => h.id === habitId);
      if (habit && habit.streak_current > 0) {
        set({
          habits: get().habits.map((h) =>
            h.id === habitId
              ? { ...h, streak_current: h.streak_current - 1, last_completed_date: null }
              : h
          ),
        });
        supabase
          .from("habits")
          .update({ streak_current: Math.max(0, (habit.streak_current || 0) - 1) })
          .eq("id", habitId)
          .then();
      }
    } else {
      // Complete
      const { data: logEntry } = await supabase
        .from("habit_log")
        .insert({ habit_id: habitId, user_id: user.id, date: today })
        .select()
        .single();

      if (logEntry) {
        set({ todayLog: [...get().todayLog, logEntry] });
      }

      // Update streak
      const habit = get().habits.find((h) => h.id === habitId);
      if (habit) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const newStreak =
          habit.last_completed_date === yesterdayStr
            ? habit.streak_current + 1
            : 1;
        const newLongest = Math.max(newStreak, habit.streak_longest);

        set({
          habits: get().habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  streak_current: newStreak,
                  streak_longest: newLongest,
                  last_completed_date: today,
                }
              : h
          ),
        });

        supabase
          .from("habits")
          .update({
            streak_current: newStreak,
            streak_longest: newLongest,
            last_completed_date: today,
          })
          .eq("id", habitId)
          .then();
      }
    }
  },

  deleteHabit: (habitId) => {
    set({ habits: get().habits.filter((h) => h.id !== habitId) });
    const supabase = createClient();
    supabase.from("habits").delete().eq("id", habitId).then();
  },

  updateHabit: (habitId, updates) => {
    set({
      habits: get().habits.map((h) =>
        h.id === habitId ? { ...h, ...updates } : h
      ),
    });
    const supabase = createClient();
    supabase.from("habits").update(updates).eq("id", habitId).then();
  },

  isCompletedToday: (habitId) => {
    return get().todayLog.some((l) => l.habit_id === habitId);
  },

  todayHabits: () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    return get()
      .habits.filter((h) => {
        if (!h.is_active) return false;
        if (h.frequency === "daily") return true;
        if (h.frequency === "weekdays") return dayOfWeek >= 1 && dayOfWeek <= 5;
        return true;
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  },
}));
