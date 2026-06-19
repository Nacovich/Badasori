-- ============================================================
-- Migración 001: Esquema inicial de Barco Manager
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PROFILES (extiende auth.users de Supabase)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Trigger: crea profile automáticamente al registrar un usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- BOATS
-- ------------------------------------------------------------
create table if not exists public.boats (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  registration  text,
  mmsi          text,
  length        numeric(6,2),
  beam          numeric(6,2),
  home_port     text,
  engine_hours  numeric(10,1) default 0,
  observations  text,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- BOAT_MEMBERS
-- ------------------------------------------------------------
create type public.user_role as enum ('admin', 'editor', 'viewer');

create table if not exists public.boat_members (
  id        uuid primary key default uuid_generate_v4(),
  boat_id   uuid not null references public.boats(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      public.user_role not null default 'viewer',
  joined_at timestamptz not null default now(),
  unique (boat_id, user_id)
);

-- ------------------------------------------------------------
-- MAINTENANCE_ITEMS
-- ------------------------------------------------------------
create type public.maintenance_status as enum ('pending', 'in_progress', 'completed');

create table if not exists public.maintenance_items (
  id                uuid primary key default uuid_generate_v4(),
  boat_id           uuid not null references public.boats(id) on delete cascade,
  title             text not null,
  category          text not null default 'otros',
  due_date          date,
  due_engine_hours  numeric(10,1),
  periodicity       text,
  status            public.maintenance_status not null default 'pending',
  notes             text,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- REPAIRS
-- ------------------------------------------------------------
create type public.repair_status as enum ('pending', 'in_progress', 'resolved');

create table if not exists public.repairs (
  id          uuid primary key default uuid_generate_v4(),
  boat_id     uuid not null references public.boats(id) on delete cascade,
  title       text not null,
  description text,
  date        date not null,
  provider    text,
  cost        numeric(10,2),
  status      public.repair_status not null default 'pending',
  notes       text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EXPENSES
-- ------------------------------------------------------------
create table if not exists public.expenses (
  id         uuid primary key default uuid_generate_v4(),
  boat_id    uuid not null references public.boats(id) on delete cascade,
  date       date not null,
  concept    text not null,
  category   text not null default 'otros',
  amount     numeric(10,2) not null,
  provider   text,
  notes      text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FUEL_LOGS
-- ------------------------------------------------------------
create table if not exists public.fuel_logs (
  id              uuid primary key default uuid_generate_v4(),
  boat_id         uuid not null references public.boats(id) on delete cascade,
  date            date not null,
  liters          numeric(8,2) not null,
  price_per_liter numeric(6,3) not null,
  total_cost      numeric(10,2) not null,
  engine_hours    numeric(10,1),
  location        text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TRIPS
-- ------------------------------------------------------------
create table if not exists public.trips (
  id                  uuid primary key default uuid_generate_v4(),
  boat_id             uuid not null references public.boats(id) on delete cascade,
  date                date not null,
  departure_port      text not null,
  arrival_port        text,
  skipper             text,
  crew                text[],
  departure_time      time,
  arrival_time        time,
  engine_hours_start  numeric(10,1),
  engine_hours_end    numeric(10,1),
  estimated_miles     numeric(8,1),
  weather             text,
  incidents           text,
  notes               text,
  created_at          timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FISHING_LOGS
-- ------------------------------------------------------------
create table if not exists public.fishing_logs (
  id                uuid primary key default uuid_generate_v4(),
  boat_id           uuid not null references public.boats(id) on delete cascade,
  trip_id           uuid references public.trips(id) on delete set null,
  date              date not null,
  species           text not null,
  zone              text,
  depth             numeric(6,1),
  bait              text,
  quantity          integer,
  catch_and_release boolean not null default false,
  observations      text,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- DOCUMENTS
-- ------------------------------------------------------------
create table if not exists public.documents (
  id          uuid primary key default uuid_generate_v4(),
  boat_id     uuid not null references public.boats(id) on delete cascade,
  type        text not null default 'otros',
  name        text not null,
  file_url    text,
  expiry_date date,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------
create index if not exists idx_boat_members_user_id    on public.boat_members(user_id);
create index if not exists idx_boat_members_boat_id    on public.boat_members(boat_id);
create index if not exists idx_maintenance_boat_id     on public.maintenance_items(boat_id);
create index if not exists idx_repairs_boat_id         on public.repairs(boat_id);
create index if not exists idx_expenses_boat_id        on public.expenses(boat_id);
create index if not exists idx_fuel_logs_boat_id       on public.fuel_logs(boat_id);
create index if not exists idx_trips_boat_id           on public.trips(boat_id);
create index if not exists idx_fishing_logs_boat_id    on public.fishing_logs(boat_id);
create index if not exists idx_documents_boat_id       on public.documents(boat_id);
