alter table accounts
add column if not exists relevance_rules jsonb not null default '{}'::jsonb;
