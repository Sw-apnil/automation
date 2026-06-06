alter table accounts
add column if not exists gnews_api_key text,
add column if not exists guardian_api_key text,
add column if not exists gnews_enabled boolean not null default true,
add column if not exists guardian_enabled boolean not null default true;

comment on column accounts.gnews_api_key is 'Per-account GNews API key for football news.';
comment on column accounts.guardian_api_key is 'Per-account Guardian API key for fallback football news.';
comment on column accounts.gnews_enabled is 'Controls whether GNews is used for this account.';
comment on column accounts.guardian_enabled is 'Controls whether Guardian fallback news is used for this account.';
