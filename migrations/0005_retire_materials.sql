-- Materials (Mat.) is no longer a tracker department. Stock work sits with Purchasing.
update action_items set department = 'purchasing' where department = 'materials';
delete from department_statuses where department = 'materials';
