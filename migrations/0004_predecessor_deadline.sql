-- Successor/predecessor links between action items, plus a project deadline
alter table action_items add column if not exists predecessor_id integer;
alter table rocs add column if not exists deadline text;
