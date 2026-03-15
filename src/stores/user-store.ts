import { create } from "zustand";
import type { User } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { getLevelForXP } from "@/lib/xp";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  updateStreak: (streak: number) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  addXP: (amount) => {
    const { user } = get();
    if (!user) return;

    const newXPTotal = user.xp_total + amount;
    const newXPSeason = user.xp_season + amount;
    const newLevel = getLevelForXP(newXPTotal);

    const updated = {
      ...user,
      xp_total: newXPTotal,
      xp_season: newXPSeason,
      level: newLevel,
    };

    set({ user: updated });

    // Persist to Supabase
    const supabase = createClient();
    supabase
      .from("users")
      .update({
        xp_total: newXPTotal,
        xp_season: newXPSeason,
        level: newLevel,
      })
      .eq("id", user.id)
      .then();
  },

  addCoins: (amount) => {
    const { user } = get();
    if (!user) return;

    const newCoins = user.coins + amount;
    set({ user: { ...user, coins: newCoins } });

    const supabase = createClient();
    supabase
      .from("users")
      .update({ coins: newCoins })
      .eq("id", user.id)
      .then();
  },

  spendCoins: (amount) => {
    const { user } = get();
    if (!user || user.coins < amount) return false;

    const newCoins = user.coins - amount;
    set({ user: { ...user, coins: newCoins } });

    const supabase = createClient();
    supabase
      .from("users")
      .update({ coins: newCoins })
      .eq("id", user.id)
      .then();

    return true;
  },

  updateStreak: (streak) => {
    const { user } = get();
    if (!user) return;

    const updated = {
      ...user,
      streak_current: streak,
      streak_longest: Math.max(user.streak_longest, streak),
    };

    set({ user: updated });

    const supabase = createClient();
    supabase
      .from("users")
      .update({
        streak_current: streak,
        streak_longest: updated.streak_longest,
        last_active_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", user.id)
      .then();
  },
}));
