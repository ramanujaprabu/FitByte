-- FitByte — Hevy-style workout tracking.
--
-- Before this, "logging a workout" only ever saved a summary (duration,
-- an estimated calorie count, a free-text muscle string) — no exercises,
-- no sets, no weights, no reps. Routines were the same: just a name and a
-- flat list of exercise *names* with no target sets/reps to log against,
-- and Create Routine didn't even persist. This adds a real exercise
-- library and the tables to log actual sets against it, and restructures
-- routines to carry real per-exercise targets.
--
-- Run this once, after 0001-0004. A brand-new project should run all five
-- migrations in order.

begin;

-- ─── Exercise library ───────────────────────────────────────────────────────
create type exercise_category as enum ('strength', 'cardio', 'bodyweight', 'stretching');

create table if not exists exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  muscle_group text not null,
  equipment text not null default 'Other',
  category exercise_category not null default 'strength',
  is_custom boolean not null default false,
  -- null for the shared library; set for a user's own custom exercise.
  user_id uuid references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists exercises_muscle_idx on exercises (muscle_group);
create index if not exists exercises_user_idx on exercises (user_id) where user_id is not null;

alter table exercises enable row level security;

create policy "read library and own custom exercises" on exercises
  for select using (user_id is null or user_id = auth.uid());
create policy "insert own custom exercises" on exercises
  for insert with check (user_id = auth.uid());
create policy "update own custom exercises" on exercises
  for update using (user_id = auth.uid());
create policy "delete own custom exercises" on exercises
  for delete using (user_id = auth.uid());

-- ─── routine_exercises: real per-exercise targets, linked to the library ────
alter table routine_exercises add column if not exists exercise_id uuid references exercises (id);
alter table routine_exercises add column if not exists rest_seconds int not null default 90;

do $$ begin
  if exists (select 1 from information_schema.columns where table_name = 'routine_exercises' and column_name = 'reps') then
    alter table routine_exercises rename column reps to target_reps;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'routine_exercises' and column_name = 'sets') then
    alter table routine_exercises rename column sets to target_sets;
  end if;
end $$;

alter table routine_exercises alter column target_sets set default 3;
alter table routine_exercises alter column target_reps set default 10;

-- `alter column ... set default` only affects future inserts — backfill any
-- rows from before this migration that were left with a null sets/reps.
update routine_exercises set target_sets = 3 where target_sets is null;
update routine_exercises set target_reps = 10 where target_reps is null;

-- ─── Logged workout detail: exercises + sets actually performed ────────────
create table if not exists workout_session_exercises (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references workout_sessions (id) on delete cascade,
  exercise_id uuid references exercises (id),
  name text not null,
  order_index int not null default 0
);
create index if not exists wse_session_idx on workout_session_exercises (session_id);
create index if not exists wse_exercise_idx on workout_session_exercises (exercise_id);

create type set_type as enum ('warmup', 'normal', 'dropset', 'failure');

create table if not exists workout_session_sets (
  id uuid primary key default uuid_generate_v4(),
  session_exercise_id uuid not null references workout_session_exercises (id) on delete cascade,
  set_index int not null default 0,
  weight_kg numeric(6,2) not null default 0,
  reps int not null default 0,
  set_type set_type not null default 'normal',
  completed boolean not null default true
);
create index if not exists wss_session_exercise_idx on workout_session_sets (session_exercise_id);

alter table workout_session_exercises enable row level security;
alter table workout_session_sets enable row level security;

create policy "own session exercises" on workout_session_exercises
  for all using (
    exists (select 1 from workout_sessions s where s.id = session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from workout_sessions s where s.id = session_id and s.user_id = auth.uid())
  );

create policy "own session sets" on workout_session_sets
  for all using (
    exists (
      select 1 from workout_session_exercises se
      join workout_sessions s on s.id = se.session_id
      where se.id = session_exercise_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from workout_session_exercises se
      join workout_sessions s on s.id = se.session_id
      where se.id = session_exercise_id and s.user_id = auth.uid()
    )
  );

-- ─── Seed the shared exercise library (only if it's empty) ────────────────
insert into exercises (name, muscle_group, equipment, category)
select * from (values
  -- Chest
  ('Barbell Bench Press','Chest','Barbell','strength'),
  ('Incline Barbell Bench Press','Chest','Barbell','strength'),
  ('Decline Barbell Bench Press','Chest','Barbell','strength'),
  ('Dumbbell Bench Press','Chest','Dumbbell','strength'),
  ('Incline Dumbbell Press','Chest','Dumbbell','strength'),
  ('Dumbbell Fly','Chest','Dumbbell','strength'),
  ('Cable Fly','Chest','Cable','strength'),
  ('Push-Up','Chest','Bodyweight','bodyweight'),
  ('Chest Dip','Chest','Bodyweight','bodyweight'),
  ('Machine Chest Press','Chest','Machine','strength'),
  ('Pec Deck','Chest','Machine','strength'),
  -- Back
  ('Deadlift','Back','Barbell','strength'),
  ('Rack Pull','Back','Barbell','strength'),
  ('Pull-Up','Back','Bodyweight','bodyweight'),
  ('Chin-Up','Back','Bodyweight','bodyweight'),
  ('Lat Pulldown','Back','Cable','strength'),
  ('Barbell Row','Back','Barbell','strength'),
  ('Dumbbell Row','Back','Dumbbell','strength'),
  ('T-Bar Row','Back','Machine','strength'),
  ('Seated Cable Row','Back','Cable','strength'),
  ('Face Pull','Back','Cable','strength'),
  ('Straight-Arm Pulldown','Back','Cable','strength'),
  ('Good Morning','Back','Barbell','strength'),
  -- Shoulders
  ('Overhead Press','Shoulders','Barbell','strength'),
  ('Dumbbell Shoulder Press','Shoulders','Dumbbell','strength'),
  ('Arnold Press','Shoulders','Dumbbell','strength'),
  ('Lateral Raise','Shoulders','Dumbbell','strength'),
  ('Front Raise','Shoulders','Dumbbell','strength'),
  ('Rear Delt Fly','Shoulders','Dumbbell','strength'),
  ('Cable Lateral Raise','Shoulders','Cable','strength'),
  ('Upright Row','Shoulders','Barbell','strength'),
  ('Barbell Shrug','Shoulders','Barbell','strength'),
  ('Machine Shoulder Press','Shoulders','Machine','strength'),
  -- Biceps
  ('Barbell Curl','Biceps','Barbell','strength'),
  ('Dumbbell Curl','Biceps','Dumbbell','strength'),
  ('Hammer Curl','Biceps','Dumbbell','strength'),
  ('Preacher Curl','Biceps','Barbell','strength'),
  ('Cable Curl','Biceps','Cable','strength'),
  ('Concentration Curl','Biceps','Dumbbell','strength'),
  -- Triceps
  ('Close-Grip Bench Press','Triceps','Barbell','strength'),
  ('Tricep Pushdown','Triceps','Cable','strength'),
  ('Overhead Tricep Extension','Triceps','Dumbbell','strength'),
  ('Skull Crusher','Triceps','Barbell','strength'),
  ('Tricep Dip','Triceps','Bodyweight','bodyweight'),
  ('Tricep Kickback','Triceps','Dumbbell','strength'),
  ('Cable Overhead Extension','Triceps','Cable','strength'),
  ('Diamond Push-Up','Triceps','Bodyweight','bodyweight'),
  -- Quads
  ('Barbell Squat','Quads','Barbell','strength'),
  ('Front Squat','Quads','Barbell','strength'),
  ('Leg Press','Quads','Machine','strength'),
  ('Leg Extension','Quads','Machine','strength'),
  ('Bulgarian Split Squat','Quads','Dumbbell','strength'),
  ('Walking Lunge','Quads','Dumbbell','strength'),
  ('Hack Squat','Quads','Machine','strength'),
  ('Goblet Squat','Quads','Dumbbell','strength'),
  -- Hamstrings
  ('Romanian Deadlift','Hamstrings','Barbell','strength'),
  ('Leg Curl','Hamstrings','Machine','strength'),
  ('Stiff-Leg Deadlift','Hamstrings','Barbell','strength'),
  ('Nordic Curl','Hamstrings','Bodyweight','bodyweight'),
  ('Glute Ham Raise','Hamstrings','Machine','strength'),
  ('Single-Leg RDL','Hamstrings','Dumbbell','strength'),
  -- Glutes
  ('Hip Thrust','Glutes','Barbell','strength'),
  ('Glute Bridge','Glutes','Bodyweight','bodyweight'),
  ('Cable Kickback','Glutes','Cable','strength'),
  ('Sumo Deadlift','Glutes','Barbell','strength'),
  ('Step-Up','Glutes','Dumbbell','strength'),
  -- Calves
  ('Standing Calf Raise','Calves','Machine','strength'),
  ('Seated Calf Raise','Calves','Machine','strength'),
  ('Leg Press Calf Raise','Calves','Machine','strength'),
  ('Donkey Calf Raise','Calves','Machine','strength'),
  -- Core
  ('Plank','Core','Bodyweight','bodyweight'),
  ('Hanging Leg Raise','Core','Bodyweight','bodyweight'),
  ('Cable Crunch','Core','Cable','strength'),
  ('Sit-Up','Core','Bodyweight','bodyweight'),
  ('Russian Twist','Core','Bodyweight','bodyweight'),
  ('Ab Wheel Rollout','Core','Other','strength'),
  ('Mountain Climber','Core','Bodyweight','bodyweight'),
  ('Bicycle Crunch','Core','Bodyweight','bodyweight'),
  ('Dead Bug','Core','Bodyweight','bodyweight'),
  ('Side Plank','Core','Bodyweight','bodyweight'),
  -- Cardio
  ('Treadmill Run','Cardio','Other','cardio'),
  ('Stationary Bike','Cardio','Other','cardio'),
  ('Rowing Machine','Cardio','Other','cardio'),
  ('Elliptical','Cardio','Other','cardio'),
  ('Jump Rope','Cardio','Other','cardio'),
  ('Stair Climber','Cardio','Other','cardio'),
  ('Sprint','Cardio','Other','cardio'),
  -- Full Body
  ('Kettlebell Swing','Full Body','Kettlebell','strength'),
  ('Burpee','Full Body','Bodyweight','bodyweight'),
  ('Thruster','Full Body','Barbell','strength'),
  ('Turkish Get-Up','Full Body','Kettlebell','strength'),
  ('Clean and Jerk','Full Body','Barbell','strength'),
  ('Snatch','Full Body','Barbell','strength')
) as seed(name, muscle_group, equipment, category)
where not exists (select 1 from exercises where is_custom = false);

commit;
