-- ============================================================
-- Migración 002: Row Level Security (RLS)
-- ============================================================
-- Todas las tablas solo son visibles para usuarios miembros del barco.
-- Los admins tienen acceso total; los editors pueden insertar/actualizar;
-- los viewers solo pueden leer.
-- ============================================================

-- Función auxiliar: comprueba si el usuario autenticado es miembro del barco
create or replace function public.is_boat_member(p_boat_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.boat_members
    where boat_id = p_boat_id
      and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Función auxiliar: devuelve el rol del usuario en el barco
create or replace function public.get_boat_role(p_boat_id uuid)
returns public.user_role as $$
  select role from public.boat_members
  where boat_id = p_boat_id
    and user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- ============================================================
-- PROFILES
-- ============================================================
alter table public.profiles enable row level security;

create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios actualizan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- BOATS
-- ============================================================
alter table public.boats enable row level security;

create policy "Miembros ven sus barcos"
  on public.boats for select
  using (public.is_boat_member(id));

create policy "Admins actualizan el barco"
  on public.boats for update
  using (public.get_boat_role(id) = 'admin');

create policy "Admins insertan barcos"
  on public.boats for insert
  with check (true); -- controlado a nivel de aplicación al crear barco+miembro

create policy "Admins borran barcos"
  on public.boats for delete
  using (public.get_boat_role(id) = 'admin');

-- ============================================================
-- BOAT_MEMBERS
-- ============================================================
alter table public.boat_members enable row level security;

create policy "Miembros ven los miembros de su barco"
  on public.boat_members for select
  using (public.is_boat_member(boat_id));

create policy "Admins gestionan miembros"
  on public.boat_members for all
  using (public.get_boat_role(boat_id) = 'admin');

-- ============================================================
-- Macro para tablas de contenido (maintenance, repairs, etc.)
-- SELECT: cualquier miembro
-- INSERT/UPDATE: admin o editor
-- DELETE: solo admin
-- ============================================================

-- MAINTENANCE_ITEMS
alter table public.maintenance_items enable row level security;

create policy "Miembros ven mantenimiento"
  on public.maintenance_items for select
  using (public.is_boat_member(boat_id));

create policy "Editors/admins gestionan mantenimiento"
  on public.maintenance_items for insert
  with check (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Editors/admins actualizan mantenimiento"
  on public.maintenance_items for update
  using (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Admins borran mantenimiento"
  on public.maintenance_items for delete
  using (public.get_boat_role(boat_id) = 'admin');

-- REPAIRS
alter table public.repairs enable row level security;

create policy "Miembros ven reparaciones"
  on public.repairs for select
  using (public.is_boat_member(boat_id));

create policy "Editors/admins insertan reparaciones"
  on public.repairs for insert
  with check (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Editors/admins actualizan reparaciones"
  on public.repairs for update
  using (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Admins borran reparaciones"
  on public.repairs for delete
  using (public.get_boat_role(boat_id) = 'admin');

-- EXPENSES
alter table public.expenses enable row level security;

create policy "Miembros ven gastos"
  on public.expenses for select
  using (public.is_boat_member(boat_id));

create policy "Editors/admins insertan gastos"
  on public.expenses for insert
  with check (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Editors/admins actualizan gastos"
  on public.expenses for update
  using (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Admins borran gastos"
  on public.expenses for delete
  using (public.get_boat_role(boat_id) = 'admin');

-- FUEL_LOGS
alter table public.fuel_logs enable row level security;

create policy "Miembros ven repostajes"
  on public.fuel_logs for select
  using (public.is_boat_member(boat_id));

create policy "Editors/admins insertan repostajes"
  on public.fuel_logs for insert
  with check (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Editors/admins actualizan repostajes"
  on public.fuel_logs for update
  using (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Admins borran repostajes"
  on public.fuel_logs for delete
  using (public.get_boat_role(boat_id) = 'admin');

-- TRIPS
alter table public.trips enable row level security;

create policy "Miembros ven salidas"
  on public.trips for select
  using (public.is_boat_member(boat_id));

create policy "Editors/admins insertan salidas"
  on public.trips for insert
  with check (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Editors/admins actualizan salidas"
  on public.trips for update
  using (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Admins borran salidas"
  on public.trips for delete
  using (public.get_boat_role(boat_id) = 'admin');

-- FISHING_LOGS
alter table public.fishing_logs enable row level security;

create policy "Miembros ven pesca"
  on public.fishing_logs for select
  using (public.is_boat_member(boat_id));

create policy "Editors/admins insertan pesca"
  on public.fishing_logs for insert
  with check (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Editors/admins actualizan pesca"
  on public.fishing_logs for update
  using (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Admins borran pesca"
  on public.fishing_logs for delete
  using (public.get_boat_role(boat_id) = 'admin');

-- DOCUMENTS
alter table public.documents enable row level security;

create policy "Miembros ven documentos"
  on public.documents for select
  using (public.is_boat_member(boat_id));

create policy "Editors/admins insertan documentos"
  on public.documents for insert
  with check (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Editors/admins actualizan documentos"
  on public.documents for update
  using (public.get_boat_role(boat_id) in ('admin', 'editor'));

create policy "Admins borran documentos"
  on public.documents for delete
  using (public.get_boat_role(boat_id) = 'admin');
