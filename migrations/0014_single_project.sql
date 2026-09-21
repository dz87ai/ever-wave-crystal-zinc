alter table rocs add column if not exists single_project boolean not null default false;
alter table rocs add column if not exists project_name text not null default '';
