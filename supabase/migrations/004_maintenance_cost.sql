alter table maintenance_items
  add column if not exists cost numeric(10,2);
