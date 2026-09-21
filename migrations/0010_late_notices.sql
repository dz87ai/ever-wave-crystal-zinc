create table if not exists late_notices (
  action_item_id integer primary key references action_items(id) on delete cascade,
  to_email text not null,
  sent_at timestamptz not null default now()
);
