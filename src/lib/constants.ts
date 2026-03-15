import type { TaskDifficulty } from "@/types";

// XP per task difficulty
export const XP_BY_DIFFICULTY: Record<TaskDifficulty, number> = {
  quick: 5,
  easy: 10,
  medium: 25,
  hard: 50,
  epic: 100,
};

// Coins = half of XP
export function coinsForXP(xp: number): number {
  return Math.floor(xp / 2);
}

// Level thresholds (logarithmic scaling)
export const LEVEL_THRESHOLDS: { level: number; xp: number; unlock: string }[] = [
  { level: 1, xp: 0, unlock: "Quest Board, Horizons basic" },
  { level: 2, xp: 100, unlock: "Streaki + tarcze" },
  { level: 3, xp: 300, unlock: "Areas health bars" },
  { level: 4, xp: 600, unlock: "Balance View" },
  { level: 5, xp: 1000, unlock: "Nowy obszar / archiwizacja" },
  { level: 6, xp: 1500, unlock: "Weekly summary email" },
  { level: 7, xp: 2200, unlock: "Goal Breakdown Assistant (AI)" },
  { level: 8, xp: 3000, unlock: "Vault rewards shop" },
  { level: 9, xp: 4000, unlock: "Seasonal stats / prestige" },
  { level: 10, xp: 5500, unlock: "Custom XP multipliers" },
];

// XP Bonuses
export const XP_BONUS = {
  STREAK_MULTIPLIER: 0.1, // +10% if streak active
  FIRST_TASK_OF_DAY: 5,
  NEGLECTED_AREA: 15, // area inactive 3+ days
  BOSS_QUEST_MULTIPLIER: 0.2, // +20% for boss quest tasks
  WEEKLY_GOAL: 200,
  QUARTERLY_GOAL: 1000,
};

// Default areas
export const DEFAULT_AREAS = [
  { name: "SEATED", color: "#3D4FE0" },
  { name: "RESTAURACJE", color: "#C4472A" },
  { name: "PAPIER & PIKSEL", color: "#5C7A3E" },
  { name: "ZDROWIE", color: "#2E7D52" },
  { name: "RELACJE", color: "#B8956A" },
  { name: "FINANSE", color: "#C49A1A" },
  { name: "MARKA", color: "#404040" },
];

// Streak milestones
export const STREAK_MILESTONES = [3, 7, 14, 30, 100];

// Max visible tasks on Quest Board
export const MAX_VISIBLE_TASKS = 5;

// Max quarterly goals
export const MAX_QUARTERLY_GOALS = 6;

// Difficulty labels (Polish)
export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  quick: "Quick",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  epic: "Epic",
};
