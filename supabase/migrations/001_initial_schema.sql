-- LEVEL: Personal OS — Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

create type task_difficulty as enum ('quick', 'easy', 'medium', 'hard', 'epic');
create type task_status as enum ('pending', 'done', 'archived');
create type goal_status as enum ('active', 'completed', 'archived');

-- ============================================
-- TABLES
-- ============================================

-- Users (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  level integer not null default 1,
  xp_total integer not null default 0,
  xp_season integer not null default 0,
  coins integer not null default 0,
  streak_current integer not null default 0,
  streak_longest integer not null default 0,
  streak_shields integer not null default 2,
  last_active_date date,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seasons
create table public.seasons (
  id uuid default uuid_generate_v4() primary key,
  number integer not null,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

-- Areas (life areas)
create table public.areas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  icon text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Goals (quarterly / Boss Quests)
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  area_id uuid references public.areas(id) on delete set null,
  title text not null,
  description text,
  target_date date,
  status goal_status not null default 'active',
  progress_percent integer not null default 0,
  xp_bonus integer not null default 1000,
  is_boss boolean not null default false,
  season_id uuid references public.seasons(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Tasks
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  area_id uuid references public.areas(id) on delete set null,
  title text not null,
  description text,
  difficulty task_difficulty not null default 'medium',
  xp_value integer not null default 25,
  coins_value integer not null default 12,
  status task_status not null default 'pending',
  scheduled_date date default current_date,
  due_date date,
  is_focus boolean not null default false,
  parent_goal_id uuid references public.goals(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- XP Log
create table public.xp_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete set null,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Rewards (Vault)
create table public.rewards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  coins_cost integer not null,
  is_redeemed boolean not null default false,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Reward Redemptions
create table public.reward_redemptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  reward_id uuid references public.rewards(id) on delete cascade not null,
  coins_spent integer not null,
  redeemed_at timestamptz not null default now()
);

-- Streak Log
create table public.streak_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  was_active boolean not null default false,
  shield_used boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_tasks_user_status on public.tasks(user_id, status);
create index idx_tasks_user_date on public.tasks(user_id, scheduled_date);
create index idx_tasks_user_focus on public.tasks(user_id, is_focus) where is_focus = true;
create index idx_goals_user_status on public.goals(user_id, status);
create index idx_areas_user on public.areas(user_id);
create index idx_xp_log_user on public.xp_log(user_id);
create index idx_streak_log_user_date on public.streak_log(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.users enable row level security;
alter table public.areas enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.seasons enable row level security;
alter table public.xp_log enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.streak_log enable row level security;

-- Users: own data only
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- Areas
create policy "Users can view own areas" on public.areas
  for select using (auth.uid() = user_id);
create policy "Users can insert own areas" on public.areas
  for insert with check (auth.uid() = user_id);
create policy "Users can update own areas" on public.areas
  for update using (auth.uid() = user_id);
create policy "Users can delete own areas" on public.areas
  for delete using (auth.uid() = user_id);

-- Tasks
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Goals
create policy "Users can view own goals" on public.goals
  for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals
  for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals
  for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals
  for delete using (auth.uid() = user_id);

-- Seasons: everyone can read
create policy "Anyone can view seasons" on public.seasons
  for select using (true);

-- XP Log
create policy "Users can view own xp_log" on public.xp_log
  for select using (auth.uid() = user_id);
create policy "Users can insert own xp_log" on public.xp_log
  for insert with check (auth.uid() = user_id);

-- Rewards
create policy "Users can view own rewards" on public.rewards
  for select using (auth.uid() = user_id);
create policy "Users can insert own rewards" on public.rewards
  for insert with check (auth.uid() = user_id);
create policy "Users can update own rewards" on public.rewards
  for update using (auth.uid() = user_id);
create policy "Users can delete own rewards" on public.rewards
  for delete using (auth.uid() = user_id);

-- Reward Redemptions
create policy "Users can view own redemptions" on public.reward_redemptions
  for select using (auth.uid() = user_id);
create policy "Users can insert own redemptions" on public.reward_redemptions
  for insert with check (auth.uid() = user_id);

-- Streak Log
create policy "Users can view own streak_log" on public.streak_log
  for select using (auth.uid() = user_id);
create policy "Users can insert own streak_log" on public.streak_log
  for insert with check (auth.uid() = user_id);
create policy "Users can update own streak_log" on public.streak_log
  for update using (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Create user profile + default areas on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create user profile
  insert into public.users (id, email)
  values (new.id, new.email);

  -- Create default 7 areas
  insert into public.areas (user_id, name, color, sort_order) values
    (new.id, 'SEATED', '#3D4FE0', 0),
    (new.id, 'RESTAURACJE', '#C4472A', 1),
    (new.id, 'WEDDING BUILDER', '#5C7A3E', 2),
    (new.id, 'ZDROWIE', '#2E7D52', 3),
    (new.id, 'RELACJE', '#B8956A', 4),
    (new.id, 'FINANSE', '#C49A1A', 5),
    (new.id, 'MARKA', '#404040', 6),
    (new.id, 'BARRY', '#8B5CF6', 7);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger: on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- FUNCTION: Seed initial season
-- ============================================

-- Create current season if none exists
insert into public.seasons (number, start_date, end_date, is_current)
select 1, '2026-01-01', '2026-03-31', true
where not exists (select 1 from public.seasons where is_current = true);
