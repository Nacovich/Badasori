-- Añadir 'boat' como tipo de entidad para fotos del barco
alter table attachments drop constraint if exists attachments_entity_type_check;
alter table attachments add constraint attachments_entity_type_check
  check (entity_type in ('repair','expense','trip','fishing_log','document','boat','fuel_log'));

-- Campo pagado por en repostajes
alter table fuel_logs
  add column if not exists paid_by text;
