"use client";

import { useState, useMemo } from "react";
import { useHabitStore } from "@/stores/habit-store";
import { useUserStore } from "@/stores/user-store";
import { useAreaStore } from "@/stores/area-store";
import { motion, AnimatePresence } from "framer-motion";

export function HabitList() {
  const allHabits = useHabitStore((s) => s.habits);
  const todayLog = useHabitStore((s) => s.todayLog);

  const habits = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return allHabits
      .filter((h) => {
        if (!h.is_active) return false;
        if (h.frequency === "daily") return true;
        if (h.frequency === "weekdays") return dayOfWeek >= 1 && dayOfWeek <= 5;
        return true;
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [allHabits]);
  const toggleHabit = useHabitStore((s) => s.toggleHabit);
  const addHabit = useHabitStore((s) => s.addHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const addXP = useUserStore((s) => s.addXP);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const areas = useAreaStore((s) => s.areas);
  const [newAreaId, setNewAreaId] = useState<string | null>(null);

  if (habits.length === 0 && !showAdd) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">
            Nawyki
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-[10px] text-accent font-medium"
          >
            + Dodaj nawyk
          </button>
        </div>
        <p className="text-xs text-foreground-secondary text-center py-4">
          Dodaj nawyki, ktore chcesz sledzic codziennie
        </p>
      </div>
    );
  }

  async function handleToggle(habitId: string) {
    const wasCompleted = todayLog.some((l) => l.habit_id === habitId);
    await toggleHabit(habitId);
    if (!wasCompleted) {
      const habit = useHabitStore.getState().habits.find((h) => h.id === habitId);
      if (habit) addXP(habit.xp_per_completion);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addHabit({ title: newTitle.trim(), area_id: newAreaId });
    setNewTitle("");
    setNewAreaId(null);
    setShowAdd(false);
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">
          Nawyki ({todayLog.length}/{habits.length})
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-[10px] text-accent font-medium"
        >
          + Dodaj
        </button>
      </div>

      {/* Add habit form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="mb-3 overflow-hidden"
          >
            <div className="p-3 bg-surface border border-border rounded-card space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nazwa nawyk..."
                autoFocus
                className="w-full bg-transparent text-sm placeholder:text-foreground-secondary focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {areas.filter((a) => a.is_active).map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setNewAreaId(newAreaId === area.id ? null : area.id)}
                    className={`text-[10px] px-2 py-1 rounded-full transition-all ${
                      newAreaId === area.id
                        ? "text-white"
                        : "text-foreground-secondary border border-border"
                    }`}
                    style={newAreaId === area.id ? { backgroundColor: area.color } : {}}
                  >
                    {area.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="text-xs bg-accent text-white px-3 py-1.5 rounded-card font-medium">Dodaj</button>
                <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-foreground-secondary">Anuluj</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habit cards */}
      <div className="space-y-1.5">
        {habits.map((habit) => {
          const completed = todayLog.some((l) => l.habit_id === habit.id);
          const area = useAreaStore.getState().getAreaById(habit.area_id || "");

          return (
            <motion.div
              key={habit.id}
              layout
              className={`flex items-center gap-3 p-3 rounded-card border transition-colors ${
                completed
                  ? "bg-success/5 border-success/20"
                  : "bg-surface border-border"
              }`}
            >
              <button
                onClick={() => handleToggle(habit.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
                  completed
                    ? "border-success bg-success text-white"
                    : "border-border hover:border-accent"
                }`}
              >
                {completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <span className={`text-sm ${completed ? "text-foreground-secondary line-through" : ""}`}>
                  {habit.title}
                </span>
              </div>

              {area && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: area.color }}
                />
              )}

              {habit.streak_current > 0 && (
                <span className="text-[10px] text-foreground-secondary font-mono flex-shrink-0">
                  🔥{habit.streak_current}
                </span>
              )}

              <button
                onClick={() => deleteHabit(habit.id)}
                className="flex-shrink-0 p-1 text-foreground-secondary/30 hover:text-red-500 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
