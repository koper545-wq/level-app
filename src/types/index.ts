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
  savings_total: number;
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
  savings_amount: number;
  recurrence_rule: string | null;
  recurrence_end_date: string | null;
  created_at: string;
  completed_at: string | null;
  // Joined
  area?: Area;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  area_id: string | null;
  frequency: string;
  streak_current: number;
  streak_longest: number;
  last_completed_date: string | null;
  xp_per_completion: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  // Joined
  area?: Area;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  is_done: boolean;
  completed_at: string | null;
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
  milestones: GoalMilestone[];
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
