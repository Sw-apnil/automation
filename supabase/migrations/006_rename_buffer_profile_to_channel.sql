do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'published_posts'
      and column_name = 'buffer_profile_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_name = 'published_posts'
      and column_name = 'buffer_channel_id'
  ) then
    alter table published_posts rename column buffer_profile_id to buffer_channel_id;
  end if;
end $$;
