-- Programming becomes CNC. Production, Assembly, and Glazing leave the tracker;
-- remaining shop-floor work sits with Fabrication.
update action_items set department = 'cnc' where department = 'programming';
update action_items
  set department = 'fabrication'
  where department in ('production', 'assembly', 'glazing');

update department_statuses set department = 'cnc' where department = 'programming';

update department_statuses as fab
set status = asm.status, notes = asm.notes
from department_statuses as asm
where fab.roc_id = asm.roc_id
  and fab.department = 'fabrication'
  and asm.department = 'assembly'
  and fab.status in ('na', 'not_started');

delete from department_statuses
where department in ('programming', 'production', 'assembly', 'glazing');
