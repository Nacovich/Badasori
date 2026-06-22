create table if not exists regularizaciones (
  id uuid primary key default gen_random_uuid(),
  boat_id uuid references boats(id) on delete cascade not null,
  date date not null default current_date,
  year integer not null,
  from_socio text not null,
  to_socio text not null,
  amount numeric(10,2) not null,
  created_at timestamptz default now()
);

alter table regularizaciones enable row level security;

create policy "Members can view regularizaciones"
  on regularizaciones for select
  using (
    exists (
      select 1 from boat_members
      where boat_members.boat_id = regularizaciones.boat_id
        and boat_members.user_id = auth.uid()
    )
  );

create policy "Editors can insert regularizaciones"
  on regularizaciones for insert
  with check (
    exists (
      select 1 from boat_members
      where boat_members.boat_id = regularizaciones.boat_id
        and boat_members.user_id = auth.uid()
        and boat_members.role in ('admin', 'editor')
    )
  );

create policy "Admins can delete regularizaciones"
  on regularizaciones for delete
  using (
    exists (
      select 1 from boat_members
      where boat_members.boat_id = regularizaciones.boat_id
        and boat_members.user_id = auth.uid()
        and boat_members.role = 'admin'
    )
  );
