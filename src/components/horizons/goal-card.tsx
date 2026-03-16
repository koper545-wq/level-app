"use client";

import { useState } from "react";
import type { Goal } from "@/types";
import { useAreaStore } from "@/stores/area-store";
import { useGoalStore } from "@/stores/goal-store";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  goal: Goal;
}

export function GoalCard({ goal }: Props) {
  const area = goal.area || useAreaStore.getState().getAreaById(goal.area_id || "");
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const addMilestone = useGoalStore((s) => s.addMilestone);
  const toggleMilestone = useGoalStore((s) => s.toggleMilestone);
  const deleteMilestone = useGoalStore((s) => s.deleteMilestone);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDesc, setEditDesc] = useState(goal.description || "");
  const [expanded, setExpanded] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  const milestones = goal.milestones || [];
  const milestonesDone = milestones.filter((m) => m.is_done).length;
  const milestonesTotal = milestones.length;

  function handleSave() {
    if (!editTitle.trim()) return;
    updateGoal(goal.id, { title: editTitle.trim(), description: editDesc.trim() || null });
    setEditing(false);
  }

  function handleDelete() {
    deleteGoal(goal.id);
  }

  if (editing) {
    return (
      <div className="bg-surface border border-border rounded-card p-4 space-y-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full bg-background border border-border rounded-card px-3 py-2 text-sm focus:outline-none focus:border-accent"
          autoFocus
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Opis (opcjonalnie)"
          rows={2}
          className="w-full bg-background border border-border rounded-card px-3 py-2 text-xs focus:outline-none focus:border-accent resize-none"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 text-xs bg-accent text-white py-2 rounded-card font-medium">Zapisz</button>
          <button onClick={() => setEditing(false)} className="flex-1 text-xs text-foreground-secondary border border-border py-2 rounded-card">Anuluj</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={`bg-surface border rounded-card p-4 ${
        goal.is_boss ? "border-accent/30 ring-1 ring-accent/10" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {goal.is_boss && (
            <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium uppercase flex-shrink-0">
              Boss
            </span>
          )}
          <h3 className="text-sm font-medium truncate">{goal.title}</h3>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {area && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: area.color }}
            >
              {area.name}
            </span>
          )}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-foreground-secondary hover:text-foreground transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-7 z-20 bg-surface border border-border rounded-card shadow-lg py-1 min-w-[120px]">
                  <button
                    onClick={() => { setEditing(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-background transition-colors"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => { handleDelete(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-background transition-colors"
                  >
                    Usun
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-foreground-secondary mb-3 line-clamp-2">
          {goal.description}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: goal.is_boss ? "#3D4FE0" : area?.color || "#6B6B6B",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress_percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-mono text-foreground-secondary w-8 text-right">
          {goal.progress_percent}%
        </span>
      </div>

      {goal.target_date && (
        <p className="text-[10px] text-foreground-secondary mt-2">
          Termin: {new Date(goal.target_date).toLocaleDateString("pl-PL")}
        </p>
      )}

      {/* Milestones toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 pt-2 border-t border-border/50 text-[10px] text-foreground-secondary hover:text-foreground transition-colors flex items-center justify-center gap-1"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {milestonesTotal > 0 ? `Milestony (${milestonesDone}/${milestonesTotal})` : "Dodaj milestony"}
      </button>

      {/* Milestones list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1.5">
              {milestones.map((ms) => (
                <div key={ms.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleMilestone(goal.id, ms.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                      ms.is_done
                        ? "border-success bg-success text-white"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    {ms.is_done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-xs flex-1 ${ms.is_done ? "line-through text-foreground-secondary" : ""}`}>
                    {ms.title}
                  </span>
                  {ms.completed_at && (
                    <span className="text-[9px] text-foreground-secondary/50">
                      {new Date(ms.completed_at).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <button
                    onClick={() => deleteMilestone(goal.id, ms.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-foreground-secondary/30 hover:text-red-500 transition-all"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newMilestone.trim()) return;
                  addMilestone(goal.id, newMilestone.trim());
                  setNewMilestone("");
                }}
                className="flex items-center gap-2 pt-1"
              >
                <span className="text-foreground-secondary text-xs">+</span>
                <input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Dodaj milestone..."
                  className="flex-1 text-xs bg-transparent placeholder:text-foreground-secondary/50 focus:outline-none"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
