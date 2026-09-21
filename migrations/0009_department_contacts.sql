create table if not exists department_contacts (
  department text primary key,
  contact_name text not null default '',
  email text not null default '',
  phone text not null default '',
  role text not null default '',
  updated_at timestamptz not null default now()
);
