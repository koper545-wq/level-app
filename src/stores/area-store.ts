import { create } from "zustand";
import type { Area } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface AreaState {
  areas: Area[];
  setAreas: (areas: Area[]) => void;
  getAreaById: (id: string) => Area | undefined;
  getAreaByName: (name: string) => Area | undefined;
  updateArea: (areaId: string, updates: Partial<Area>) => void;
}

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: [],

  setAreas: (areas) => set({ areas }),

  getAreaById: (id) => get().areas.find((a) => a.id === id),

  getAreaByName: (name) =>
    get().areas.find((a) => a.name.toLowerCase() === name.toLowerCase()),

  updateArea: (areaId, updates) => {
    set({
      areas: get().areas.map((a) =>
        a.id === areaId ? { ...a, ...updates } : a
      ),
    });

    const supabase = createClient();
    supabase.from("areas").update(updates).eq("id", areaId).then();
  },
}));
