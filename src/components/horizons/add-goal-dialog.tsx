"use client";

import { useState } from "react";
import { useGoalStore } from "@/stores/goal-store";
import { useAreaStore } from "@/stores/area-store";
import { useUserStore } from "@/stores/user-store";
import { useTaskStore } from "@/stores/task-store";
import { motion } from "framer-motion";
import type { TaskDifficulty } from "@/types";

interface Props {
  onClose: () => void;
}

export function AddGoalDialog({ onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState("");
  const [isBoss, setIsBoss] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSteps, setAiSteps] = useState<{ title: string; difficulty: TaskDifficulty }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const addGoal = useGoalStore((s) => s.addGoal);
  const addTask = useTaskStore((s) => s.addTask);
  const areas = useAreaStore((s) => s.areas);
  const userLevel = useUserStore((s) => s.user?.level ?? 1);

  async function handleBreakdown() {
    if (!title.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/goals/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.steps) setAiSteps(data.steps);
    } catch {
      // silently fail
    }
    setAiLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const goal = await addGoal({
      title: title.trim(),
      area_id: areaId,
      description: description.trim() || undefined,
      target_date: targetDate || undefined,
      is_boss: isBoss,
    });

    // Create subtasks from AI breakdown
    if (goal && aiSteps.length > 0) {
      for (const step of aiSteps) {
        await addTask({
          title: step.title,
          area_id: areaId,
          difficulty: step.difficulty,
          parent_goal_id: goal.id,
        });
      }
    }

    setLoading(false);
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-card p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-display mb-4">Nowy cel kwartalny</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nazwa celu"
            autoFocus
            className="w-full px-3 py-2.5 bg-background border border-border rounded-card text-sm focus:outline-none focus:border-accent"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opis (opcjonalny)"
            rows={2}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-card text-sm focus:outline-none focus:border-accent resize-none"
          />

          {/* Area chips */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-foreground-secondary mb-2">
              Obszar
            </p>
            <div className="flex flex-wrap gap-1.5">
              {areas.filter((a) => a.is_active).map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setAreaId(areaId === area.id ? null : area.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${
                    areaId === area.id
                      ? "text-white"
                      : "text-foreground-secondary border border-border"
                  }`}
                  style={areaId === area.id ? { backgroundColor: area.color } : {}}
                >
                  {area.name}
                </button>
              ))}
            </div>
          </div>

          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-card text-sm focus:outline-none focus:border-accent"
          />

          {/* Boss Quest toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-10 h-6 rounded-full transition-colors relative ${
                isBoss ? "bg-accent" : "bg-border"
              }`}
              onClick={() => setIsBoss(!isBoss)}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isBoss ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <span className="text-sm">Boss Quest</span>
          </label>

          {/* AI Breakdown (Level 7+) */}
          {userLevel >= 7 && (
            <div>
              <button
                type="button"
                onClick={handleBreakdown}
                disabled={!title.trim() || aiLoading}
                className="text-xs text-accent hover:underline disabled:opacity-50"
              >
                {aiLoading ? "Generowanie..." : "Rozloz na kroki (AI)"}
              </button>

              {aiSteps.length > 0 && (
                <div className="mt-2 space-y-1">
                  {aiSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-background rounded-md text-xs"
                    >
                      <span className="text-foreground-secondary">{i + 1}.</span>
                      <span className="flex-1">{step.title}</span>
                      <span className="text-[10px] text-foreground-secondary uppercase">
                        {step.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-card text-sm text-foreground-secondary hover:bg-background transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="flex-1 py-2.5 bg-accent text-white rounded-card text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Dodawanie..." : "Dodaj cel"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
