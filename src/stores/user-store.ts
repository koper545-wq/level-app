import { create } from "zustand";
import type { User } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { getLevelForXP } from "@/lib/xp";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  addRewards: (params: { xp: number; coins: number; savings?: number }) => void;
  spendCoins: (amount: number) => boolean;
  addSavings: (amount: number) => void;
  updateStreak: (streak: number) => void;
}

// Debounced persist: collect all changes, flush once
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let pendingUpdate: Record<string, number | string> = {};
let pendingUserId: string | null = null;

function flushPersist() {
  if (!pendingUserId || Object.keys(pendingUpdate).length === 0) return;
  const supabase = createClient();
  const update = { ...pendingUpdate };
  const userId = pendingUserId;
  pendingUpdate = {};
  pendingUserId = null;
  supabase.from("users").update(update).eq("id", userId).then();
}

function schedulePersist(userId: string, fields: Record<string, number | string>) {
  pendingUserId = userId;
  Object.assign(pendingUpdate, fields);
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(flushPersist, 100);
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

    set({
      user: {
        ...user,
        xp_total: newXPTotal,
        xp_season: newXPSeason,
        level: newLevel,
      },
    });

    schedulePersist(user.id, {
      xp_total: newXPTotal,
      xp_season: newXPSeason,
      level: newLevel,
    });
  },

  addCoins: (amount) => {
    const { user } = get();
    if (!user) return;

    const newCoins = user.coins + amount;
    set({ user: { ...user, coins: newCoins } });

    schedulePersist(user.id, { coins: newCoins });
  },

  addRewards: ({ xp, coins, savings }) => {
    const { user } = get();
    if (!user) return;

    const newXPTotal = user.xp_total + xp;
    const newXPSeason = user.xp_season + xp;
    const newLevel = getLevelForXP(newXPTotal);
    const newCoins = user.coins + coins;
    const newSavings = user.savings_total + (savings || 0);

    set({
      user: {
        ...user,
        xp_total: newXPTotal,
        xp_season: newXPSeason,
        level: newLevel,
        coins: newCoins,
        savings_total: newSavings,
      },
    });

    schedulePersist(user.id, {
      xp_total: newXPTotal,
      xp_season: newXPSeason,
      level: newLevel,
      coins: newCoins,
      savings_total: newSavings,
    });
  },

  spendCoins: (amount) => {
    const { user } = get();
    if (!user || user.coins < amount) return false;

    const newCoins = user.coins - amount;
    set({ user: { ...user, coins: newCoins } });

    schedulePersist(user.id, { coins: newCoins });

    return true;
  },

  addSavings: (amount) => {
    const { user } = get();
    if (!user) return;

    const newTotal = user.savings_total + amount;
    set({ user: { ...user, savings_total: newTotal } });

    schedulePersist(user.id, { savings_total: newTotal });
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

    schedulePersist(user.id, {
      streak_current: streak,
      streak_longest: updated.streak_longest,
      last_active_date: new Date().toISOString().split("T")[0],
    });
  },
}));
