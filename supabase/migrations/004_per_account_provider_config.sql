alter table accounts
add column if not exists groq_api_key text,
add column if not exists groq_model text,
add column if not exists groq_temperature numeric(3,2) not null default 0.85 check (groq_temperature >= 0 and groq_temperature <= 2),
add column if not exists groq_max_tokens integer not null default 180 check (groq_max_tokens between 32 and 1000),
add column if not exists buffer_access_token text,
add column if not exists news_api_key text,
add column if not exists api_football_key text;

comment on column accounts.groq_api_key is 'Required per-account Groq key for enabled accounts.';
comment on column accounts.groq_model is 'Required per-account Groq model for enabled accounts.';
comment on column accounts.buffer_access_token is 'Required per-account Buffer token for enabled accounts.';
comment on column accounts.news_api_key is 'Required per-account NewsAPI key for enabled accounts.';
comment on column accounts.api_football_key is 'Required per-account API-Football key for enabled accounts.';
