alter table accounts
add column if not exists duplicate_retention_days integer not null default 90 check (duplicate_retention_days between 7 and 3650);

comment on column accounts.duplicate_retention_days is 'How long duplicate marker rows are kept for this account before cleanup.';
