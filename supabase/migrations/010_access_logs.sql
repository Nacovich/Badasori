create table if not exists access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text,
  user_name text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists access_logs_user_created on access_logs (user_id, created_at desc);
create index if not exists access_logs_created on access_logs (created_at desc);

alter table access_logs enable row level security;

create policy "Users can insert their own access log"
  on access_logs for insert
  with check (user_id = auth.uid());

create policy "Admins can view all access logs"
  on access_logs for select
  using (
    exists (
      select 1 from boat_members
      where boat_members.user_id = auth.uid()
        and boat_members.role = 'admin'
    )
  );
