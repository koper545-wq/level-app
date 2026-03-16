import { create } from "zustand";
import type { Task } from "@/types";

const COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours
const TIMER_MS = 45 * 60 * 1000; // 45 minutes
const TRIGGER_CHANCE = 0.2; // 20% chance

interface BonusQuestState {
  activeQuest: Task | null;
  expiresAt: number | null;
  multiplier: number;

  tryTrigger: (todayTasks: Task[]) => void;
  clearQuest: () => void;
  isTaskBonus: (taskId: string) => boolean;
}

export const useBonusQuestStore = create<BonusQuestState>((set, get) => ({
  activeQuest: null,
  expiresAt: null,
  multiplier: 2,

  tryTrigger: (todayTasks: Task[]) => {
    // Don't trigger if already active
    if (get().activeQuest) return;

    // Check cooldown
    const lastTrigger = localStorage.getItem("bonus_quest_last");
    if (lastTrigger && Date.now() - parseInt(lastTrigger) < COOLDOWN_MS) return;

    // Need at least 2 pending tasks
    const pending = todayTasks.filter((t) => t.status === "pending" && !t.is_focus);
    if (pending.length < 2) return;

    // Random chance
    if (Math.random() > TRIGGER_CHANCE) return;

    // Pick random task
    const randomTask = pending[Math.floor(Math.random() * pending.length)];

    set({
      activeQuest: randomTask,
      expiresAt: Date.now() + TIMER_MS,
    });

    localStorage.setItem("bonus_quest_last", Date.now().toString());
  },

  clearQuest: () => {
    set({ activeQuest: null, expiresAt: null });
  },

  isTaskBonus: (taskId: string) => {
    const { activeQuest, expiresAt } = get();
    if (!activeQuest || !expiresAt) return false;
    if (Date.now() > expiresAt) {
      set({ activeQuest: null, expiresAt: null });
      return false;
    }
    return activeQuest.id === taskId;
  },
}));
