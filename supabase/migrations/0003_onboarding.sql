-- FitByte — post-signup onboarding: physical stats, goal, and computed
-- calorie/macro targets split across meals.
--
-- Adds the columns the onboarding flow reads/writes. Existing accounts get
-- onboarding_completed = false too, since they also lack real targets today
-- (calorie/macro targets have only ever been defaults for every account).

begin;

alter table profiles add column if not exists onboarding_completed boolean not null default false;
alter table profiles add column if not exists age int;
alter table profiles add column if not exists sex text check (sex in ('male', 'female'));

alter table body_metrics add column if not exists height_cm numeric(5,2) not null default 0;

alter table fitness_goals add column if not exists goal_type text check (goal_type in ('lose', 'maintain', 'gain'));
alter table fitness_goals add column if not exists activity_level text;
alter table fitness_goals add column if not exists includes_snacks boolean not null default true;
alter table fitness_goals add column if not exists meal_split jsonb not null default '{}'::jsonb;

commit;
