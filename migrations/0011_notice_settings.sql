-- How late-task emails go out: immediately (with optional reminders),
-- a daily digest, or a weekly digest. One combined email per department.
create table if not exists notice_settings (
  id integer primary key default 1,
  mode text not null default 'immediate',
  remind_every_hours integer not null default 24,
  daily_time text not null default '17:00',
  weekly_day integer not null default 1,
  weekly_time text not null default '09:00',
  timezone text not null default 'America/New_York',
  updated_at timestamptz not null default now(),
  constraint notice_settings_singleton check (id = 1)
);

insert into notice_settings (id) values (1) on conflict (id) do nothing;

create table if not exists notice_digests (
  department text not null,
  period_key text not null,
  to_email text not null,
  sent_at timestamptz not null default now(),
  primary key (department, period_key)
);
