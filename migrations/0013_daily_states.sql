-- End-of-day tracker snapshots for Settings → Restore
create table if not exists tracker_states (
  id serial primary key,
  day text not null unique,
  captured_at timestamptz not null default now(),
  payload text not null,
  summary text not null default ''
);
