-- FitByte — align an already-provisioned Supabase project with the schema
-- the app actually queries (as defined by 0001_init.sql).
--
-- Context: this project's tables were created with different column names/
-- types and three tables missing entirely, compared to what 0001_init.sql
-- defines and what services/api/*.ts queries. Every affected query fails
-- silently (caught and defaulted, or falls back to the offline cache), so
-- the app has been running mostly on local device storage instead of
-- Supabase for food logging, workout history, water tracking, macro
-- targets, and achievements.
--
-- Run this ONCE in the SQL Editor of the existing project. A brand-new
-- Supabase project should just run 0001_init.sql — it already matches the
-- app and does not need this file.

begin;

-- ─── body_metrics: recorded_at → updated_at, enforce one row per user ──────
-- Defensive de-dupe first, in case more than one row per user ever got
-- written (keeps the most recently recorded row per user).
delete from body_metrics a using body_metrics b
where a.user_id = b.user_id
  and (a.recorded_at, a.id) < (b.recorded_at, b.id);

alter table body_metrics rename column recorded_at to updated_at;
alter table body_metrics add constraint body_metrics_user_id_key unique (user_id);

-- The live table's numeric columns had no default at all (unlike
-- 0001_init.sql's `default 0`), which is what made the earlier backfill
-- attempt fail with a not-null violation. Give them real defaults so any
-- future bare `insert (user_id)` (including the signup trigger below) works.
alter table body_metrics alter column weight set default 0;
alter table body_metrics alter column goal_weight set default 0;
alter table body_metrics alter column body_fat_percent set default 0;
alter table body_metrics alter column bmi set default 0;
alter table body_metrics alter column goal_completion_percent set default 0;
alter table body_metrics alter column updated_at set default now();

-- ─── fitness_goals: match the macro_* column names the app queries ────────
alter table fitness_goals rename column protein_target to macro_protein;
alter table fitness_goals rename column carbs_target to macro_carbs;
alter table fitness_goals rename column fats_target to macro_fats;

-- ─── calorie_targets: same "no default on the live table" defensive fix ──
alter table calorie_targets alter column daily set default 2000;
alter table calorie_targets alter column maintenance set default 2200;
alter table calorie_targets alter column current_percent set default 0;
alter table calorie_targets alter column updated_at set default now();

-- ─── food_entries: add the logged_at timestamp every query relies on ──────
alter table food_entries add column if not exists logged_at timestamptz;

-- Best-effort backfill for any rows already sitting in the table: combine
-- the existing logged_date with midnight, since the `time` text column
-- ("Now", "10:32 AM", ...) isn't reliably parseable in SQL.
update food_entries
set logged_at = coalesce(logged_date::timestamptz, now())
where logged_at is null;

alter table food_entries alter column logged_at set default now();
alter table food_entries alter column logged_at set not null;

-- Stop blocking inserts that (correctly) no longer populate these — the app
-- derives display time from logged_at instead. Left in place, unused,
-- rather than dropped, so nothing here is destructive.
alter table food_entries alter column "time" drop not null;
alter table food_entries alter column logged_date drop not null;

create index if not exists food_entries_user_day_idx on food_entries (user_id, logged_at desc);

-- ─── workout_sessions: "timestamp" → performed_at, durations as integers ──
alter table workout_sessions rename column "timestamp" to performed_at;

alter table workout_sessions
  alter column duration_mins type integer
  using (case when duration_mins ~ '^\d+$' then duration_mins::integer else 0 end);

alter table workout_sessions
  alter column calories_burned type integer
  using (case when calories_burned ~ '^\d+$' then calories_burned::integer else 0 end);

create index if not exists workout_sessions_user_day_idx on workout_sessions (user_id, performed_at desc);

-- ─── daily_logs: missing table — water intake + nutrition score per day ───
create table if not exists daily_logs (
  user_id uuid not null references profiles (id) on delete cascade,
  log_date date not null default current_date,
  water_glasses int not null default 0,
  water_goal int not null default 8,
  nutrition_score int not null default 0,
  primary key (user_id, log_date)
);
alter table daily_logs enable row level security;
drop policy if exists "own daily_logs" on daily_logs;
create policy "own daily_logs" on daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── achievements: missing table ───────────────────────────────────────────
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  streak_days int not null default 0,
  icon text not null default 'trophy-outline',
  earned_at timestamptz not null default now()
);
alter table achievements enable row level security;
drop policy if exists "own achievements" on achievements;
create policy "own achievements" on achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── routine_exercises: missing child table of workout_routines ──────────
create table if not exists routine_exercises (
  id uuid primary key default uuid_generate_v4(),
  routine_id uuid not null references workout_routines (id) on delete cascade,
  name text not null,
  sets int,
  reps int,
  order_index int not null default 0
);
alter table routine_exercises enable row level security;
drop policy if exists "own routine_exercises" on routine_exercises;
create policy "own routine_exercises" on routine_exercises
  for all using (
    exists (select 1 from workout_routines r where r.id = routine_id and r.user_id = auth.uid())
  ) with check (
    exists (select 1 from workout_routines r where r.id = routine_id and r.user_id = auth.uid())
  );

-- ─── Re-assert the signup trigger, and backfill any missing per-user rows ──
-- (idempotent — safe whether or not this already matches what's live)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email)
  on conflict (id) do nothing;

  insert into public.body_metrics (user_id, weight, goal_weight, body_fat_percent, bmi, goal_completion_percent)
  values (new.id, 0, 0, 0, 0, 0)
  on conflict (user_id) do nothing;

  insert into public.calorie_targets (user_id, daily, maintenance, current_percent)
  values (new.id, 2000, 2200, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill body_metrics/calorie_targets for any existing profile missing one
-- (e.g. signed up before this migration, or before the trigger existed).
insert into body_metrics (user_id, weight, goal_weight, body_fat_percent, bmi, goal_completion_percent)
select p.id, 0, 0, 0, 0, 0 from profiles p
left join body_metrics b on b.user_id = p.id
where b.user_id is null;

insert into calorie_targets (user_id, daily, maintenance, current_percent)
select p.id, 2000, 2200, 0 from profiles p
left join calorie_targets c on c.user_id = p.id
where c.user_id is null;

commit;
