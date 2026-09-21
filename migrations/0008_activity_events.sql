create table if not exists activity_events (
  id serial primary key,
  occurred_at timestamptz not null default now(),
  kind text not null,
  roc_id integer not null references rocs(id) on delete cascade,
  action_item_id integer references action_items(id) on delete set null,
  department text,
  title text not null,
  details text not null default '',
  posted_as text not null default 'Engineering'
);

create index if not exists activity_events_occurred_idx on activity_events (occurred_at desc);
create index if not exists activity_events_roc_idx on activity_events (roc_id);
