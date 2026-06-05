with ranked_prompts as (
  select
    id,
    row_number() over (partition by account_id order by created_at desc) as prompt_rank
  from account_prompts
  where active = true
)
update account_prompts
set active = false
where id in (
  select id
  from ranked_prompts
  where prompt_rank > 1
);

create unique index if not exists account_prompts_one_active_idx
on account_prompts(account_id)
where active = true;
