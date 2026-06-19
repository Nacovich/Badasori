-- ============================================================
-- SEED: Datos de ejemplo para desarrollo
-- Ejecutar DESPUÉS de crear los usuarios en Supabase Auth
-- Reemplaza los UUIDs de ejemplo con los reales de tus usuarios
-- ============================================================

-- IMPORTANTE: Primero crea los usuarios desde el panel de Supabase Auth
-- y anota sus UUIDs. Luego reemplaza los valores de abajo.

-- Ejemplo de barco
insert into public.boats (id, name, registration, mmsi, length, beam, home_port, engine_hours, observations)
values (
  '00000000-0000-0000-0000-000000000001',
  'Mi Barco',
  'MA-1234-A',
  '224123456',
  9.5,
  3.2,
  'Puerto Deportivo',
  1250.5,
  'Barco de ejemplo para desarrollo'
) on conflict (id) do nothing;

-- Ejemplo de miembro admin (reemplaza el UUID con el del usuario real)
-- insert into public.boat_members (boat_id, user_id, role)
-- values (
--   '00000000-0000-0000-0000-000000000001',
--   'TU-USER-UUID-AQUI',
--   'admin'
-- );

-- Ejemplo de mantenimiento
insert into public.maintenance_items (boat_id, title, category, due_date, status, notes)
values
  ('00000000-0000-0000-0000-000000000001', 'Cambio de aceite motor', 'motor', current_date + interval '30 days', 'pending', 'Aceite 15W-40'),
  ('00000000-0000-0000-0000-000000000001', 'Revisión extintor', 'seguridad', current_date + interval '60 days', 'pending', null),
  ('00000000-0000-0000-0000-000000000001', 'ITB anual', 'documentación', current_date + interval '90 days', 'pending', null)
on conflict do nothing;

-- Ejemplo de gastos
insert into public.expenses (boat_id, date, concept, category, amount, provider)
values
  ('00000000-0000-0000-0000-000000000001', current_date - interval '5 days', 'Amarre mensual', 'puerto', 120.00, 'Puerto Deportivo'),
  ('00000000-0000-0000-0000-000000000001', current_date - interval '10 days', 'Filtro aceite', 'mantenimiento', 35.50, 'Tienda náutica'),
  ('00000000-0000-0000-0000-000000000001', current_date - interval '15 days', 'Gasoil', 'gasoil', 180.00, 'Gasolinera del puerto')
on conflict do nothing;

-- Ejemplo de repostaje
insert into public.fuel_logs (boat_id, date, liters, price_per_liter, total_cost, engine_hours, location)
values
  ('00000000-0000-0000-0000-000000000001', current_date - interval '15 days', 100.0, 1.80, 180.00, 1245.0, 'Gasolinera del puerto')
on conflict do nothing;
