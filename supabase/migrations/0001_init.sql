-- FitByte — initial schema
-- Run this in Supabase Studio (SQL Editor) or via `supabase db push`.

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ──────────────────────────────────────────────────────────────────
create type meal_type as enum ('Breakfast', 'Lunch', 'Dinner', 'Snacks');
create type workout_intensity as enum ('Low', 'Medium', 'High', 'Extreme');

-- ─── profiles ───────────────────────────────────────────────────────────────
-- One row per auth user. Created automatically on signup (trigger below).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  avatar_url text default '',
  goal text default '',
  quote text default '',
  level int not null default 1,
  streak_days int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── body_metrics ───────────────────────────────────────────────────────────
create table body_metrics (
  user_id uuid primary key references profiles (id) on delete cascade,
  weight numeric(6,2) not null default 0,          -- kg
  goal_weight numeric(6,2) not null default 0,     -- kg
  body_fat_percent numeric(5,2) not null default 0,
  bmi numeric(5,2) not null default 0,
  goal_completion_percent numeric(5,2) not null default 0,
  updated_at timestamptz not null default now()
);

-- ─── fitness_goals ──────────────────────────────────────────────────────────
create table fitness_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  program_name text not null,
  completion_percent numeric(5,2) not null default 0,
  estimated_months numeric(4,1) not null default 0,
  macro_protein int not null default 0,   -- grams, daily target
  macro_carbs int not null default 0,
  macro_fats int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index fitness_goals_user_active_idx on fitness_goals (user_id) where is_active;

-- ─── calorie_targets ────────────────────────────────────────────────────────
create table calorie_targets (
  user_id uuid primary key references profiles (id) on delete cascade,
  daily int not null default 2000,
  maintenance int not null default 2200,
  updated_at timestamptz not null default now()
);

-- ─── achievements ───────────────────────────────────────────────────────────
create table achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  streak_days int not null default 0,
  icon text not null default 'trophy-outline',
  earned_at timestamptz not null default now()
);

-- ─── food_entries ───────────────────────────────────────────────────────────
create table food_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  meal meal_type not null,
  calories numeric(7,2) not null default 0,
  protein numeric(6,2) not null default 0,
  carbs numeric(6,2) not null default 0,
  fats numeric(6,2) not null default 0,
  image_url text default '',
  source text default 'manual',        -- 'usda' | 'openfoodfacts' | 'manual'
  source_id text,                      -- external food id, for re-lookup/audit
  logged_at timestamptz not null default now()
);
create index food_entries_user_day_idx on food_entries (user_id, logged_at desc);

-- ─── daily_logs ─────────────────────────────────────────────────────────────
-- Non-food-derived per-day state: water intake, nutrition score.
create table daily_logs (
  user_id uuid not null references profiles (id) on delete cascade,
  log_date date not null default current_date,
  water_glasses int not null default 0,
  water_goal int not null default 8,
  nutrition_score int not null default 0,
  primary key (user_id, log_date)
);

-- ─── ai_insights ────────────────────────────────────────────────────────────
create table ai_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null check (type in ('positive', 'warning', 'critical')),
  text text not null,
  icon text not null default 'sparkles-outline',
  created_at timestamptz not null default now()
);

-- ─── workout_routines ───────────────────────────────────────────────────────
create table workout_routines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  muscles text not null default '',
  duration_mins int not null default 0,
  estimated_calories text default '',
  is_favorite boolean not null default false,
  last_performed timestamptz,
  created_at timestamptz not null default now()
);

create table routine_exercises (
  id uuid primary key default uuid_generate_v4(),
  routine_id uuid not null references workout_routines (id) on delete cascade,
  name text not null,
  sets int,
  reps int,
  order_index int not null default 0
);

-- ─── workout_sessions ───────────────────────────────────────────────────────
create table workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  routine_id uuid references workout_routines (id) on delete set null,
  routine_name text not null,
  duration_mins int not null default 0,
  calories_burned int not null default 0,
  muscles text default '',
  intensity workout_intensity not null default 'Medium',
  performed_at timestamptz not null default now()
);
create index workout_sessions_user_day_idx on workout_sessions (user_id, performed_at desc);

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table body_metrics enable row level security;
alter table fitness_goals enable row level security;
alter table calorie_targets enable row level security;
alter table achievements enable row level security;
alter table food_entries enable row level security;
alter table daily_logs enable row level security;
alter table ai_insights enable row level security;
alter table workout_routines enable row level security;
alter table routine_exercises enable row level security;
alter table workout_sessions enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own body_metrics" on body_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own fitness_goals" on fitness_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own calorie_targets" on calorie_targets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own achievements" on achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own food_entries" on food_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own daily_logs" on daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own ai_insights" on ai_insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own workout_routines" on workout_routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own routine_exercises" on routine_exercises
  for all using (
    exists (select 1 from workout_routines r where r.id = routine_id and r.user_id = auth.uid())
  ) with check (
    exists (select 1 from workout_routines r where r.id = routine_id and r.user_id = auth.uid())
  );

create policy "own workout_sessions" on workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Auto-provision profile + defaults on signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email);

  insert into public.body_metrics (user_id) values (new.id);
  insert into public.calorie_targets (user_id) values (new.id);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Storage bucket for avatars & food photos ──────────────────────────────
insert into storage.buckets (id, name, public)
values ('fitbyte-images', 'fitbyte-images', true)
on conflict (id) do nothing;

create policy "read own or public images" on storage.objects
  for select using (bucket_id = 'fitbyte-images');

create policy "upload own images" on storage.objects
  for insert with check (
    bucket_id = 'fitbyte-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "update own images" on storage.objects
  for update using (
    bucket_id = 'fitbyte-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "delete own images" on storage.objects
  for delete using (
    bucket_id = 'fitbyte-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
