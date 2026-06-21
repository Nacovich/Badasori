alter table expenses
  add column if not exists paid_by text;
