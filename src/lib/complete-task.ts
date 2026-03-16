import type { Task } from "@/types";
import { useTaskStore } from "@/stores/task-store";
import { useUserStore } from "@/stores/user-store";
import { useBonusQuestStore } from "@/stores/bonus-quest-store";
import { calculateTaskXP, getLevelForXP } from "@/lib/xp";
import { coinsForXP, STREAK_MILESTONES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { checkAndUpdateStreak } from "@/lib/streaks";

export interface CompletionResult {
  xpEarned: number;
  coinsEarned: number;
  milestone: {
    type: "streak" | "level" | "boss";
    title: string;
    subtitle: string;
    xp?: number;
    coins?: number;
  } | null;
}

async function isFirstTaskToday(userId: string): Promise<boolean> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("xp_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00`)
    .lt("created_at", `${today}T23:59:59`)
    .like("reason", "task_complete%");
  return (count ?? 0) === 0;
}

async function isAreaNeglected(areaId: string | null, userId: string): Promise<boolean> {
  if (!areaId) return false;
  const supabase = createClient();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("area_id", areaId)
    .eq("status", "done")
    .gte("completed_at", threeDaysAgo.toISOString());
  return (count ?? 0) === 0;
}

export async function handleTaskCompletion(task: Task): Promise<CompletionResult | null> {
  const user = useUserStore.getState().user;
  if (!user) return null;

  // Complete the task in store + DB
  const completed = await useTaskStore.getState().completeTask(task.id);
  if (!completed) return null;

  // Check XP bonus conditions
  const [firstTask, neglectedArea] = await Promise.all([
    isFirstTaskToday(user.id),
    isAreaNeglected(task.area_id, user.id),
  ]);

  const oldXP = user.xp_total;
  const oldLevel = getLevelForXP(oldXP);

  // Calculate XP
  let { total } = calculateTaskXP({
    difficulty: task.difficulty,
    hasStreak: user.streak_current > 0,
    isFirstTaskOfDay: firstTask,
    isNeglectedArea: neglectedArea,
    isBossQuestTask: !!task.parent_goal_id,
  });

  // Apply bonus quest multiplier
  const isBonusQuest = useBonusQuestStore.getState().isTaskBonus(task.id);
  if (isBonusQuest) {
    total = total * useBonusQuestStore.getState().multiplier;
    useBonusQuestStore.getState().clearQuest();
  }

  const coins = coinsForXP(total);

  // Update stores
  useUserStore.getState().addXP(total);
  useUserStore.getState().addCoins(coins);

  // Log XP
  const supabase = createClient();
  supabase
    .from("xp_log")
    .insert({
      user_id: user.id,
      task_id: task.id,
      amount: total,
      reason: `task_complete:${task.difficulty}`,
    })
    .then();

  // Update streak
  const { newStreak, milestone: streakMilestone } = await checkAndUpdateStreak(user.id);
  useUserStore.getState().updateStreak(newStreak);

  // Update goal progress if task belongs to a goal
  if (task.parent_goal_id) {
    const { useGoalStore } = await import("@/stores/goal-store");
    useGoalStore.getState().updateProgress(task.parent_goal_id);
  }

  // Create next recurring task if applicable
  if (task.recurrence_rule) {
    await createNextRecurrence(task);
  }

  // Check milestones
  let milestone: CompletionResult["milestone"] = null;

  // Streak milestone
  if (streakMilestone && STREAK_MILESTONES.includes(newStreak)) {
    milestone = {
      type: "streak",
      title: `${newStreak}-dniowy streak!`,
      subtitle: "Tak trzymaj, konsekwencja to klucz",
      xp: newStreak * 10,
      coins: newStreak * 5,
    };
    // Award milestone bonus
    useUserStore.getState().addXP(newStreak * 10);
    useUserStore.getState().addCoins(newStreak * 5);
  }

  // Level-up milestone
  const newLevel = getLevelForXP(oldXP + total);
  if (newLevel > oldLevel && !milestone) {
    milestone = {
      type: "level",
      title: `Level ${newLevel}!`,
      subtitle: `Odblokowano nowe funkcje`,
    };
  }

  return { xpEarned: total, coinsEarned: coins, milestone };
}

async function createNextRecurrence(task: Task): Promise<void> {
  const rule = task.recurrence_rule;
  if (!rule || !task.scheduled_date) return;

  const nextDate = getNextOccurrence(task.scheduled_date, rule);
  if (!nextDate) return;

  // Check if past end date
  if (task.recurrence_end_date && nextDate > task.recurrence_end_date) return;

  await useTaskStore.getState().addTask({
    title: task.title,
    area_id: task.area_id,
    difficulty: task.difficulty,
    scheduled_date: nextDate,
    parent_goal_id: task.parent_goal_id,
  });

  // Update the new task with recurrence info
  const tasks = useTaskStore.getState().tasks;
  const newTask = tasks.find(
    (t) => t.title === task.title && t.scheduled_date === nextDate && t.status === "pending"
  );
  if (newTask) {
    useTaskStore.getState().updateTask(newTask.id, {
      recurrence_rule: task.recurrence_rule,
      recurrence_end_date: task.recurrence_end_date,
    });
  }
}

export function getNextOccurrence(currentDate: string, rule: string): string | null {
  const date = new Date(currentDate + "T00:00:00");

  if (rule === "daily") {
    date.setDate(date.getDate() + 1);
  } else if (rule === "weekdays") {
    do {
      date.setDate(date.getDate() + 1);
    } while (date.getDay() === 0 || date.getDay() === 6);
  } else if (rule.startsWith("weekly:")) {
    // e.g. "weekly:mon,wed,fri"
    const dayMap: Record<string, number> = {
      nd: 0, pn: 1, wt: 2, sr: 3, cz: 4, pt: 5, sb: 6,
    };
    const days = rule.replace("weekly:", "").split(",").map((d) => dayMap[d.trim()] ?? -1).filter((d) => d >= 0);
    if (days.length === 0) return null;
    for (let i = 1; i <= 7; i++) {
      const next = new Date(date);
      next.setDate(next.getDate() + i);
      if (days.includes(next.getDay())) {
        return next.toISOString().split("T")[0];
      }
    }
  } else if (rule.startsWith("monthly:")) {
    const dayOfMonth = parseInt(rule.replace("monthly:", ""));
    date.setMonth(date.getMonth() + 1);
    date.setDate(Math.min(dayOfMonth, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  } else if (rule.startsWith("custom:")) {
    const interval = parseInt(rule.replace("custom:", ""));
    date.setDate(date.getDate() + (interval || 1));
  } else {
    return null;
  }

  return date.toISOString().split("T")[0];
}
