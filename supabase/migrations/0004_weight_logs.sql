-- FitByte — weight history.
--
-- `body_metrics` only ever held the *current* weight (one row per user), so
-- there was no way to show a weight trend anywhere. This adds an
-- append-only log the Trends tab reads from, and keeps `body_metrics.weight`
-- as a fast "current value" cache updated alongside every new entry.
--
-- Run this once against an existing project. A brand-new project should run
-- 0001_init.sql, 0002_align_schema_with_app.sql (if needed), 0003_onboarding.sql,
-- then this file, in order.

begin;

create table if not exists weight_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  weight_kg numeric(6,2) not null,
  logged_at timestamptz not null default now()
);
create index if not exists weight_logs_user_day_idx on weight_logs (user_id, logged_at desc);

alter table weight_logs enable row level security;

create policy "own weight_logs" on weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
