alter table accounts
add column if not exists buffer_channel_ids text[] not null default '{}',
add column if not exists schedule_interval_minutes integer not null default 15 check (schedule_interval_minutes between 5 and 1440),
add column if not exists schedule_time_slots text[] not null default '{}',
add column if not exists last_run_at timestamptz;

update accounts
set buffer_channel_ids = buffer_profiles
where buffer_channel_ids = '{}' and buffer_profiles <> '{}';

comment on column accounts.buffer_channel_ids is 'Required Buffer channel IDs for enabled accounts. Buffer already knows each channel platform.';
comment on column accounts.schedule_interval_minutes is 'How often this account is eligible to run. Vercel cron wakes the app; this field controls per-account due logic.';
comment on column accounts.schedule_time_slots is 'Optional HH:MM local-time slots. Empty means any time, subject to interval.';
comment on column accounts.last_run_at is 'Last successful account pipeline attempt timestamp.';
