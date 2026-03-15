import { create } from "zustand";
import type { Area } from "@/types";

interface AreaState {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  getAreaById: (id: string) => Area | undefined;
  getAreaByName: (name: string) => Area | undefined;
}

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: [],

  setAreas: (areas) => set({ areas }),

  getAreaById: (id) => get().areas.find((a) => a.id === id),

  getAreaByName: (name) =>
    get().areas.find((a) => a.name.toLowerCase() === name.toLowerCase()),
}));
