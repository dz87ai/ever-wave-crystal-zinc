-- ROC design-change tracker (unowned shared rows — no user_id)
create table if not exists app_meta (
  key   text primary key,
  value text not null
);

create table if not exists rocs (
  id                    serial primary key,
  roc_number            text not null,
  title                 text not null,
  description           text not null default '',
  overall_status        text not null default 'not_started',
  critical_release_date text,
  actual_release_date   text,
  release_description   text not null default '',
  implementation_notes  text not null default '',
  additional_notes      text not null default '',
  affected_projects     text not null default '',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists roc_meetings (
  id           serial primary key,
  roc_id       integer not null references rocs(id) on delete cascade,
  meeting_date text not null,
  notes        text not null,
  created_at   timestamptz not null default now()
);

create table if not exists roc_documents (
  id             serial primary key,
  roc_id         integer not null references rocs(id) on delete cascade,
  title          text not null,
  kind           text not null,
  date_required  text,
  date_completed text,
  created_at     timestamptz not null default now()
);

create table if not exists roc_attachments (
  id           serial primary key,
  roc_id       integer not null references rocs(id) on delete cascade,
  filename     text not null,
  mime         text not null default 'application/octet-stream',
  extract_text text not null default '',
  created_at   timestamptz not null default now()
);

create table if not exists department_statuses (
  id         serial primary key,
  roc_id     integer not null references rocs(id) on delete cascade,
  department text not null,
  status     text not null default 'not_started',
  notes      text not null default '',
  unique (roc_id, department)
);

create table if not exists action_items (
  id         serial primary key,
  roc_id     integer not null references rocs(id) on delete cascade,
  department text not null,
  title      text not null,
  details    text not null default '',
  priority   text not null default 'low',
  status     text not null default 'open',
  posted_as  text not null default 'Engineering',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists action_updates (
  id             serial primary key,
  action_item_id integer not null references action_items(id) on delete cascade,
  body           text not null,
  posted_as      text not null default 'Engineering',
  created_at     timestamptz not null default now()
);

create index if not exists roc_meetings_roc_idx on roc_meetings (roc_id);
create index if not exists roc_documents_roc_idx on roc_documents (roc_id);
create index if not exists roc_attachments_roc_idx on roc_attachments (roc_id);
create index if not exists dept_status_roc_idx on department_statuses (roc_id);
create index if not exists action_items_roc_idx on action_items (roc_id);
create index if not exists action_updates_item_idx on action_updates (action_item_id);
