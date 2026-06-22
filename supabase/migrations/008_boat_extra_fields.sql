alter table boats
  add column if not exists nib text,
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists build_year integer,
  add column if not exists hull_serial text,
  add column if not exists engine1_serial text,
  add column if not exists engine2_serial text;
