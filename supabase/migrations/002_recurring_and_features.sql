-- Migration 002: Recurring tasks, subtasks, habits, push subscriptions
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. RECURRING TASKS — add recurrence columns to tasks
-- ============================================================
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE DEFAULT NULL;

-- ============================================================
-- 2. SUBTASKS — checklist items within a task
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON public.subtasks(task_id);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subtasks_select" ON public.subtasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "subtasks_insert" ON public.subtasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "subtasks_update" ON public.subtasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

CREATE POLICY "subtasks_delete" ON public.subtasks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

-- ============================================================
-- 3. HABITS — daily/weekly habit tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
  frequency TEXT DEFAULT 'daily',
  streak_current INT DEFAULT 0,
  streak_longest INT DEFAULT 0,
  last_completed_date DATE,
  xp_per_completion INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_all" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.habit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_log_habit ON public.habit_log(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_log_user_date ON public.habit_log(user_id, date);

ALTER TABLE public.habit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_log_all" ON public.habit_log
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 4. PUSH SUBSCRIPTIONS — Web Push notification endpoints
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subs_all" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 5. GOOGLE CALENDAR TOKENS — on users table
-- ============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS google_calendar_token TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS google_calendar_refresh TEXT DEFAULT NULL;
