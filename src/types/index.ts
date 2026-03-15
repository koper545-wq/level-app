export type TaskDifficulty = "quick" | "easy" | "medium" | "hard" | "epic";
export type TaskStatus = "pending" | "done" | "archived";
export type GoalStatus = "active" | "completed" | "archived";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  level: number;
  xp_total: number;
  xp_season: number;
  coins: number;
  streak_current: number;
  streak_longest: number;
  streak_shields: number;
  last_active_date: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Area {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  area_id: string | null;
  title: string;
  description: string | null;
  difficulty: TaskDifficulty;
  xp_value: number;
  coins_value: number;
  status: TaskStatus;
  scheduled_date: string | null;
  due_date: string | null;
  is_focus: boolean;
  parent_goal_id: string | null;
  sort_order: number;
  created_at: string;
  completed_at: string | null;
  // Joined
  area?: Area;
}

export interface Goal {
  id: string;
  user_id: string;
  area_id: string | null;
  title: string;
  description: string | null;
  target_date: string | null;
  status: GoalStatus;
  progress_percent: number;
  xp_bonus: number;
  is_boss: boolean;
  season_id: string | null;
  created_at: string;
  completed_at: string | null;
  // Joined
  area?: Area;
  tasks?: Task[];
}

export interface Season {
  id: string;
  number: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface XPLogEntry {
  id: string;
  user_id: string;
  task_id: string | null;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  title: string;
  coins_cost: number;
  is_redeemed: boolean;
  redeemed_at: string | null;
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  coins_spent: number;
  redeemed_at: string;
}

export interface StreakLogEntry {
  id: string;
  user_id: string;
  date: string;
  was_active: boolean;
  shield_used: boolean;
  created_at: string;
}
