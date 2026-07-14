-- Butterflii HQ, Phase 0: schema + profiles + RLS.
--
-- This has already been applied to project ypyxshljancxlvtjlpyo via the
-- Supabase MCP tools (apply_migration). Kept here as the source of truth /
-- for reproducing on a different project, and as a reference for the RLS
-- design. Re-running is safe: `create schema if not exists`, `on conflict do
-- nothing` on the seed insert.

create schema if not exists hq;

create table if not exists hq.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null check (role in ('super_admin','ops_admin','artist')),
  avatar text,
  created_at timestamptz not null default now()
);

alter table hq.profiles enable row level security;

-- SECURITY DEFINER helper avoids RLS self-recursion when a policy needs to
-- check the caller's own role.
create or replace function hq.current_profile_role()
returns text language sql security definer set search_path = hq stable
as $$ select role from hq.profiles where id = auth.uid(); $$;

drop policy if exists "profiles_select_all_authenticated" on hq.profiles;
create policy "profiles_select_all_authenticated"
  on hq.profiles for select to authenticated using (true);

drop policy if exists "profiles_insert_super_admin_only" on hq.profiles;
create policy "profiles_insert_super_admin_only"
  on hq.profiles for insert to authenticated
  with check (hq.current_profile_role() = 'super_admin');

drop policy if exists "profiles_update_own_row" on hq.profiles;
create policy "profiles_update_own_row"
  on hq.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Postgres RLS is row-scoped, not column-scoped, so "may update own
-- display_name/avatar but not own role" needs a trigger, not a policy.
create or replace function hq.prevent_unauthorized_role_change()
returns trigger language plpgsql security definer set search_path = hq as $$
begin
  if new.role is distinct from old.role and hq.current_profile_role() is distinct from 'super_admin' then
    raise exception 'only super_admin may change role';
  end if;
  if new.id is distinct from old.id then
    raise exception 'id is immutable';
  end if;
  return new;
end; $$;

drop trigger if exists trg_profiles_guard_role on hq.profiles;
create trigger trg_profiles_guard_role
before update on hq.profiles for each row
execute function hq.prevent_unauthorized_role_change();

-- No delete policy: deletes default-deny via the API.

-- Seed the three real profiles. The two adult UUIDs already exist in
-- auth.users on this project; Elsie's must be created first (Supabase
-- Studio > Authentication > Users > Add user, email elsieolatoye@gmail.com,
-- password = her 6-digit PIN, Auto Confirm checked), then replace the
-- placeholder UUID below before running this final insert.
insert into hq.profiles (id, display_name, role, avatar) values
  ('6db243b3-5569-42df-be96-a1833ce3b628', 'Owner', 'super_admin', '🦋'),
  ('68df4017-63f1-489e-8574-29f40e67b61c', 'Funmi', 'ops_admin', '🦋')
  -- , ('<elsieolatoye@gmail.com auth uid>', 'Elsie', 'artist', '🎨')
on conflict (id) do nothing;
