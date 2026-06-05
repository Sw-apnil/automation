create extension if not exists pgcrypto;
create extension if not exists fuzzystrmatch;

create type event_category as enum (
  'transfer',
  'fixture',
  'result',
  'standing',
  'injury',
  'squad',
  'team_news',
  'quote',
  'academy',
  'other'
);

create type queue_status as enum ('pending', 'publishing', 'published', 'failed', 'skipped');
create type publish_platform as enum ('x', 'threads');
create type audit_level as enum ('info', 'warning', 'error');

create table accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  keywords text[] not null default '{}',
  hashtags text[] not null default '{}',
  style text not null default 'football fan',
  character_limit integer not null default 260 check (character_limit between 80 and 2000),
  relevance_threshold integer not null default 7 check (relevance_threshold between 0 and 10),
  max_posts_per_run integer not null default 3 check (max_posts_per_run between 1 and 10),
  enabled boolean not null default true,
  buffer_profiles text[] not null default '{}',
  platforms publish_platform[] not null default '{x}',
  team_id integer,
  league_id integer,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table account_prompts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null default 'default',
  prompt_template text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (account_id, name)
);

create table source_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  source text not null,
  source_event_id text not null,
  source_url text,
  title text not null,
  description text,
  image_url text,
  category event_category not null default 'other',
  score integer not null default 0 check (score between 0 and 10),
  metadata jsonb not null default '{}',
  published_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (account_id, source, source_event_id)
);

create index source_events_account_created_idx on source_events(account_id, created_at desc);
create index source_events_score_idx on source_events(score desc);
create index source_events_source_url_idx on source_events(source_url) where source_url is not null;

create table published_events (
  id uuid primary key default gen_random_uuid(),
  source_event_id text not null,
  account_id uuid not null references accounts(id) on delete cascade,
  headline_hash text not null,
  normalized_headline text not null,
  source_url text,
  created_at timestamptz not null default now(),
  unique (account_id, source_event_id),
  unique (account_id, headline_hash)
);

create index published_events_url_idx on published_events(account_id, source_url) where source_url is not null;
create index published_events_normalized_idx on published_events using gin (to_tsvector('simple', normalized_headline));

create table post_queue (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  event_id uuid not null references source_events(id) on delete cascade,
  content text not null,
  hashtags text[] not null default '{}',
  image_url text,
  status queue_status not null default 'pending',
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  next_attempt_at timestamptz not null default now(),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id)
);

create index post_queue_status_idx on post_queue(status, next_attempt_at);

create table published_posts (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references post_queue(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  platform publish_platform not null,
  buffer_profile_id text not null,
  post_id text not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (platform, post_id)
);

create table api_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete set null,
  level audit_level not null default 'info',
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on audit_logs(created_at desc);
create index audit_logs_type_idx on audit_logs(event_type);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger accounts_set_updated_at
before update on accounts
for each row execute function set_updated_at();

create trigger post_queue_set_updated_at
before update on post_queue
for each row execute function set_updated_at();

insert into accounts (name, slug, keywords, hashtags, style, character_limit, relevance_threshold, max_posts_per_run, platforms, team_id, league_id, logo_url)
values
  ('Real Madrid', 'real-madrid', array['Real Madrid', 'Mbappe', 'Bellingham', 'Vinicius', 'Hala Madrid'], array['#HalaMadrid', '#RealMadrid', '#Madridistas'], 'Excited Madridista with Hinglish energy', 260, 7, 3, array['x','threads']::publish_platform[], 541, 2, 'https://media.api-sports.io/football/teams/541.png'),
  ('FIFA World Cup', 'fifa-world-cup', array['FIFA World Cup', 'World Cup 2026', 'USA 2026', 'Mexico 2026', 'Canada 2026', 'qualifiers', 'national team'], array['#FIFAWorldCup', '#WorldCup2026', '#Football'], 'Global football fan', 260, 7, 4, array['x','threads']::publish_platform[], null, 1, null),
  ('Champions League', 'champions-league', array['Champions League', 'UCL', 'UEFA Champions League'], array['#UCL', '#ChampionsLeague', '#Football'], 'European nights football fan', 260, 7, 3, array['x','threads']::publish_platform[], null, 2, null),
  ('Barcelona', 'barcelona', array['Barcelona', 'Barca', 'Lamine Yamal', 'Pedri', 'Gavi'], array['#Barca', '#ForcaBarca', '#FCBarcelona'], 'Passionate Barca supporter', 260, 7, 3, array['x','threads']::publish_platform[], 529, 2, 'https://media.api-sports.io/football/teams/529.png'),
  ('Arsenal', 'arsenal', array['Arsenal', 'Saka', 'Odegaard', 'Arteta', 'Gunners'], array['#Arsenal', '#COYG', '#Gunners'], 'North London matchday fan', 260, 7, 3, array['x','threads']::publish_platform[], 42, 39, 'https://media.api-sports.io/football/teams/42.png');

insert into account_prompts (account_id, prompt_template)
select id, 'You are an excited Madridista. React like a fan, not a reporter. Use confident emotional energy. Occasional Hinglish is allowed. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.' from accounts where slug = 'real-madrid'
union all
select id, 'You are a global football fan reacting to World Cup news. Sound emotional, excited, and human. Do not sound like a journalist. Keep it accessible for fans across countries. Use short punchy lines. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.' from accounts where slug = 'fifa-world-cup'
union all
select id, 'You are reacting to Champions League news like a fan who lives for European nights. Make it emotional, sharp, and human. Do not sound like a journalist. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.' from accounts where slug = 'champions-league'
union all
select id, 'You are a passionate Barca supporter. React with warmth, pride, and real fan emotion. Do not write like a news report. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.' from accounts where slug = 'barcelona'
union all
select id, 'You are a North London Arsenal fan. React like matchday group-chat energy: honest, punchy, emotional. Do not sound like a journalist. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.' from accounts where slug = 'arsenal';
