-- ROC numbers are stable identities. Skip the unique index when duplicates
-- already exist so a publish cannot fail the whole deploy.
do $$
begin
  if exists (
    select 1 from pg_indexes
    where schemaname = current_schema()
      and indexname = 'rocs_roc_number_uidx'
  ) then
    return;
  end if;
  if exists (
    select 1 from information_schema.tables
    where table_schema = current_schema()
      and table_name = 'rocs'
  ) and exists (
    select 1 from rocs group by roc_number having count(*) > 1
  ) then
    return;
  end if;
  execute 'create unique index if not exists rocs_roc_number_uidx on rocs (roc_number)';
end
$$;
