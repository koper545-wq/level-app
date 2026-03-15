import { LEVEL_THRESHOLDS, XP_BONUS, XP_BY_DIFFICULTY } from "./constants";
import type { TaskDifficulty } from "@/types";

export function getBaseXP(difficulty: TaskDifficulty): number {
  return XP_BY_DIFFICULTY[difficulty];
}

export function calculateTaskXP(params: {
  difficulty: TaskDifficulty;
  hasStreak: boolean;
  isFirstTaskOfDay: boolean;
  isNeglectedArea: boolean;
  isBossQuestTask: boolean;
}): { total: number; breakdown: { reason: string; amount: number }[] } {
  const base = getBaseXP(params.difficulty);
  const breakdown: { reason: string; amount: number }[] = [
    { reason: "base", amount: base },
  ];

  let total = base;

  if (params.isFirstTaskOfDay) {
    breakdown.push({ reason: "first_task_of_day", amount: XP_BONUS.FIRST_TASK_OF_DAY });
    total += XP_BONUS.FIRST_TASK_OF_DAY;
  }

  if (params.isNeglectedArea) {
    breakdown.push({ reason: "neglected_area", amount: XP_BONUS.NEGLECTED_AREA });
    total += XP_BONUS.NEGLECTED_AREA;
  }

  if (params.hasStreak) {
    const streakBonus = Math.floor(total * XP_BONUS.STREAK_MULTIPLIER);
    breakdown.push({ reason: "streak_bonus", amount: streakBonus });
    total += streakBonus;
  }

  if (params.isBossQuestTask) {
    const bossBonus = Math.floor(base * XP_BONUS.BOSS_QUEST_MULTIPLIER);
    breakdown.push({ reason: "boss_quest", amount: bossBonus });
    total += bossBonus;
  }

  return { total, breakdown };
}

export function getLevelForXP(xpTotal: number): number {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xpTotal >= threshold.xp) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
}

export function getXPForNextLevel(currentLevel: number): number {
  const next = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);
  return next ? next.xp : Infinity;
}

export function getXPProgress(xpTotal: number): {
  currentLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
} {
  const currentLevel = getLevelForXP(xpTotal);
  const currentLevelXP =
    LEVEL_THRESHOLDS.find((t) => t.level === currentLevel)?.xp ?? 0;
  const nextLevelXP = getXPForNextLevel(currentLevel);

  const progressPercent =
    nextLevelXP === Infinity
      ? 100
      : Math.floor(
          ((xpTotal - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
        );

  return { currentLevel, currentLevelXP, nextLevelXP, progressPercent };
}
