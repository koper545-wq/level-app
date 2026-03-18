import { create } from "zustand";

type Phase = "idle" | "selecting" | "active" | "summary";

interface SessionState {
  phase: Phase;
  selectedTaskIds: string[];
  duration: number; // seconds
  startedAt: number | null; // Date.now()
  completedInSession: number;
  xpInSession: number;

  startSelecting: () => void;
  toggleTask: (taskId: string) => void;
  startSession: (durationSec: number) => void;
  recordCompletion: (xp: number) => void;
  endSession: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  phase: "idle",
  selectedTaskIds: [],
  duration: 1500, // 25 min default
  startedAt: null,
  completedInSession: 0,
  xpInSession: 0,

  startSelecting: () => set({ phase: "selecting", selectedTaskIds: [] }),

  toggleTask: (taskId) =>
    set((s) => ({
      selectedTaskIds: s.selectedTaskIds.includes(taskId)
        ? s.selectedTaskIds.filter((id) => id !== taskId)
        : [...s.selectedTaskIds, taskId],
    })),

  startSession: (durationSec) =>
    set({
      phase: "active",
      duration: durationSec,
      startedAt: Date.now(),
      completedInSession: 0,
      xpInSession: 0,
    }),

  recordCompletion: (xp) =>
    set((s) => ({
      completedInSession: s.completedInSession + 1,
      xpInSession: s.xpInSession + xp,
    })),

  endSession: () => set({ phase: "summary" }),

  reset: () =>
    set({
      phase: "idle",
      selectedTaskIds: [],
      duration: 1500,
      startedAt: null,
      completedInSession: 0,
      xpInSession: 0,
    }),
}));
