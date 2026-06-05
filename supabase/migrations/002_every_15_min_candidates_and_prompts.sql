alter table accounts
add column if not exists max_posts_per_run integer not null default 3 check (max_posts_per_run between 1 and 10);

update accounts
set
  keywords = array['FIFA World Cup', 'World Cup 2026', 'USA 2026', 'Mexico 2026', 'Canada 2026', 'qualifiers', 'national team'],
  hashtags = array['#FIFAWorldCup', '#WorldCup2026', '#Football'],
  max_posts_per_run = 4
where slug = 'fifa-world-cup';

update accounts
set max_posts_per_run = coalesce(max_posts_per_run, 3);

update account_prompts
set active = false
where name = 'default';

insert into account_prompts (account_id, name, prompt_template, active)
select id, 'every-15-min', 'You are an excited Madridista. React like a fan, not a reporter. Use confident emotional energy. Occasional Hinglish is allowed. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.', true
from accounts where slug = 'real-madrid'
on conflict (account_id, name) do update set prompt_template = excluded.prompt_template, active = true;

insert into account_prompts (account_id, name, prompt_template, active)
select id, 'every-15-min', 'You are a global football fan reacting to World Cup news. Sound emotional, excited, and human. Do not sound like a journalist. Keep it accessible for fans across countries. Use short punchy lines. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.', true
from accounts where slug = 'fifa-world-cup'
on conflict (account_id, name) do update set prompt_template = excluded.prompt_template, active = true;

insert into account_prompts (account_id, name, prompt_template, active)
select id, 'every-15-min', 'You are reacting to Champions League news like a fan who lives for European nights. Make it emotional, sharp, and human. Do not sound like a journalist. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.', true
from accounts where slug = 'champions-league'
on conflict (account_id, name) do update set prompt_template = excluded.prompt_template, active = true;

insert into account_prompts (account_id, name, prompt_template, active)
select id, 'every-15-min', 'You are a passionate Barca supporter. React with warmth, pride, and real fan emotion. Do not write like a news report. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.', true
from accounts where slug = 'barcelona'
on conflict (account_id, name) do update set prompt_template = excluded.prompt_template, active = true;

insert into account_prompts (account_id, name, prompt_template, active)
select id, 'every-15-min', 'You are a North London Arsenal fan. React like matchday group-chat energy: honest, punchy, emotional. Do not sound like a journalist. Event data controls substance: {title}. Context: {description}. Category: {category}. Stay under {characterLimit} characters before hashtags.', true
from accounts where slug = 'arsenal'
on conflict (account_id, name) do update set prompt_template = excluded.prompt_template, active = true;
