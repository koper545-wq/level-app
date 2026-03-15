"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAreaStore } from "@/stores/area-store";
import { useGoalStore } from "@/stores/goal-store";
import { useUserStore } from "@/stores/user-store";
import { useTaskStore } from "@/stores/task-store";
import { createClient } from "@/lib/supabase/client";

interface Props {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [firstGoal, setFirstGoal] = useState("");
  const [firstTask, setFirstTask] = useState("");
  const areas = useAreaStore((s) => s.areas);
  const addGoal = useGoalStore((s) => s.addGoal);
  const addTask = useTaskStore((s) => s.addTask);
  const user = useUserStore((s) => s.user);

  async function handleFinish() {
    const supabase = createClient();

    // Save display name
    if (name.trim() && user) {
      await supabase
        .from("users")
        .update({ display_name: name.trim(), onboarding_completed: true })
        .eq("id", user.id);
      useUserStore.getState().setUser({ ...user, display_name: name.trim(), onboarding_completed: true });
    }

    // Create goal if provided
    if (firstGoal.trim()) {
      await addGoal({ title: firstGoal.trim(), is_boss: true });
    }

    // Create task if provided
    if (firstTask.trim()) {
      await addTask({ title: firstTask.trim() });
    }

    onComplete();
  }

  const steps = [
    // Step 0: Welcome
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <h1 className="text-4xl font-display mb-3">LEVEL</h1>
      <p className="text-foreground-secondary text-sm mb-8">
        Twoj osobisty system planowania i progresji
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jak masz na imie?"
        className="w-full px-4 py-3 bg-surface border border-border rounded-card text-center text-sm focus:outline-none focus:border-accent mb-6"
        autoFocus
      />
      <button
        onClick={() => setStep(1)}
        className="w-full py-3 bg-accent text-white rounded-card font-medium"
      >
        Dalej
      </button>
    </motion.div>,

    // Step 1: Areas overview
    <motion.div
      key="areas"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-2xl font-display mb-2">Twoje obszary</h2>
      <p className="text-foreground-secondary text-sm mb-6">
        7 obszarow zycia, kazdy z wlasnym kolorem. Mozesz je pozniej zmienic.
      </p>
      <div className="space-y-2 mb-6">
        {areas.filter((a) => a.is_active).map((area) => (
          <div
            key={area.id}
            className="flex items-center gap-3 p-3 bg-surface border border-border rounded-card"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: area.color }}
            />
            <span className="text-sm">{area.name}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setStep(2)}
        className="w-full py-3 bg-accent text-white rounded-card font-medium"
      >
        Dalej
      </button>
    </motion.div>,

    // Step 2: First goal
    <motion.div
      key="goal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-2xl font-display mb-2">Twoj glowny cel</h2>
      <p className="text-foreground-secondary text-sm mb-6">
        Jaki jest Twoj najwazniejszy cel na ten kwartal? To bedzie Twoj Boss Quest.
      </p>
      <input
        type="text"
        value={firstGoal}
        onChange={(e) => setFirstGoal(e.target.value)}
        placeholder="np. Odpalic Seated"
        className="w-full px-4 py-3 bg-surface border border-border rounded-card text-sm focus:outline-none focus:border-accent mb-6"
        autoFocus
      />
      <button
        onClick={() => setStep(3)}
        className="w-full py-3 bg-accent text-white rounded-card font-medium"
      >
        {firstGoal.trim() ? "Dalej" : "Pomin"}
      </button>
    </motion.div>,

    // Step 3: First task
    <motion.div
      key="task"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-2xl font-display mb-2">Pierwszy krok</h2>
      <p className="text-foreground-secondary text-sm mb-6">
        Co mozesz zrobic dzisiaj? Jeden maly krok wystarczy.
      </p>
      <input
        type="text"
        value={firstTask}
        onChange={(e) => setFirstTask(e.target.value)}
        placeholder="np. Napisac plan projektu"
        className="w-full px-4 py-3 bg-surface border border-border rounded-card text-sm focus:outline-none focus:border-accent mb-6"
        autoFocus
      />
      <button
        onClick={handleFinish}
        className="w-full py-3 bg-accent text-white rounded-card font-medium"
      >
        Zacznij
      </button>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex gap-1.5 justify-center mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i <= step ? "w-6 bg-accent" : "w-3 bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </div>
    </div>
  );
}
