-- Action items can be a dated action or a simple note
alter table action_items add column if not exists kind text not null default 'action';
alter table action_items add column if not exists due_date text;
