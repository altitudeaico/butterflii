-- Butterflii HQ, Phase 1: events, objectives, tasks + RLS.
--
-- Applied to project ypyxshljancxlvtjlpyo via the Supabase MCP tools
-- (apply_migration). Kept here as the source of truth, alongside
-- seed-profiles.sql. Re-running is safe: `create table if not exists`,
-- `create or replace function`, `drop policy/trigger if exists` before
-- create.

create table if not exists hq.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  location text,
  mode text not null check (mode in ('prep','event','wrapped')) default 'prep',
  sales_target int,
  names_target int,
  created_by uuid references hq.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists hq.objectives (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references hq.events(id) on delete cascade,
  title text not null,
  why text,
  target int,
  sort_order int not null default 0
);

create table if not exists hq.tasks (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references hq.objectives(id) on delete cascade,
  title text not null,
  owner_id uuid references hq.profiles(id),
  deadline date,
  status text not null check (status in ('todo','doing','done','blocked')) default 'todo',
  is_critical boolean not null default false,
  weight int not null default 1,
  blocked_by uuid references hq.tasks(id),
  origin text not null check (origin in ('adult','artist_idea')) default 'adult',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_objectives_event_id on hq.objectives(event_id);
create index if not exists idx_tasks_objective_id on hq.tasks(objective_id);
create index if not exists idx_tasks_owner_id on hq.tasks(owner_id);

alter table hq.events enable row level security;
alter table hq.objectives enable row level security;
alter table hq.tasks enable row level security;

-- events: read for all, write scoped by role. Ops admin runs delivery so may
-- update operational fields, but only super_admin creates/deletes an event.
drop policy if exists "events_select_all_authenticated" on hq.events;
create policy "events_select_all_authenticated"
  on hq.events for select to authenticated using (true);

drop policy if exists "events_insert_super_admin" on hq.events;
create policy "events_insert_super_admin"
  on hq.events for insert to authenticated
  with check (hq.current_profile_role() = 'super_admin');

drop policy if exists "events_update_admins" on hq.events;
create policy "events_update_admins"
  on hq.events for update to authenticated
  using (hq.current_profile_role() in ('super_admin','ops_admin'))
  with check (hq.current_profile_role() in ('super_admin','ops_admin'));

drop policy if exists "events_delete_super_admin" on hq.events;
create policy "events_delete_super_admin"
  on hq.events for delete to authenticated
  using (hq.current_profile_role() = 'super_admin');

-- objectives: same shape as events.
drop policy if exists "objectives_select_all_authenticated" on hq.objectives;
create policy "objectives_select_all_authenticated"
  on hq.objectives for select to authenticated using (true);

drop policy if exists "objectives_insert_super_admin" on hq.objectives;
create policy "objectives_insert_super_admin"
  on hq.objectives for insert to authenticated
  with check (hq.current_profile_role() = 'super_admin');

drop policy if exists "objectives_update_admins" on hq.objectives;
create policy "objectives_update_admins"
  on hq.objectives for update to authenticated
  using (hq.current_profile_role() in ('super_admin','ops_admin'))
  with check (hq.current_profile_role() in ('super_admin','ops_admin'));

drop policy if exists "objectives_delete_super_admin" on hq.objectives;
create policy "objectives_delete_super_admin"
  on hq.objectives for delete to authenticated
  using (hq.current_profile_role() = 'super_admin');

-- tasks: read for all. super_admin/ops_admin have full write access. The
-- artist may only insert a draft idea (origin = 'artist_idea', unowned,
-- untouched status/critical flag for the adults to triage) and may only
-- update the status of a task she owns, never any other column on it.
drop policy if exists "tasks_select_all_authenticated" on hq.tasks;
create policy "tasks_select_all_authenticated"
  on hq.tasks for select to authenticated using (true);

drop policy if exists "tasks_insert_admins" on hq.tasks;
create policy "tasks_insert_admins"
  on hq.tasks for insert to authenticated
  with check (hq.current_profile_role() in ('super_admin','ops_admin'));

drop policy if exists "tasks_insert_artist_idea" on hq.tasks;
create policy "tasks_insert_artist_idea"
  on hq.tasks for insert to authenticated
  with check (
    hq.current_profile_role() = 'artist'
    and origin = 'artist_idea'
    and owner_id is null
    and status = 'todo'
    and is_critical = false
  );

drop policy if exists "tasks_update_admins" on hq.tasks;
create policy "tasks_update_admins"
  on hq.tasks for update to authenticated
  using (hq.current_profile_role() in ('super_admin','ops_admin'))
  with check (hq.current_profile_role() in ('super_admin','ops_admin'));

drop policy if exists "tasks_update_own_status_artist" on hq.tasks;
create policy "tasks_update_own_status_artist"
  on hq.tasks for update to authenticated
  using (hq.current_profile_role() = 'artist' and owner_id = auth.uid())
  with check (hq.current_profile_role() = 'artist' and owner_id = auth.uid());

drop policy if exists "tasks_delete_admins" on hq.tasks;
create policy "tasks_delete_admins"
  on hq.tasks for delete to authenticated
  using (hq.current_profile_role() in ('super_admin','ops_admin'));

-- RLS is row-scoped, not column-scoped: the artist's update policy above lets
-- her touch her own row, but says nothing about which columns. This trigger
-- closes that gap, rejecting any artist update that changes a column other
-- than status (mirrors the profiles role-change guard from Phase 0).
create or replace function hq.prevent_artist_task_overreach()
returns trigger language plpgsql security definer set search_path = hq as $$
begin
  if hq.current_profile_role() = 'artist' then
    if new.id is distinct from old.id
      or new.objective_id is distinct from old.objective_id
      or new.title is distinct from old.title
      or new.owner_id is distinct from old.owner_id
      or new.deadline is distinct from old.deadline
      or new.is_critical is distinct from old.is_critical
      or new.weight is distinct from old.weight
      or new.blocked_by is distinct from old.blocked_by
      or new.origin is distinct from old.origin
    then
      raise exception 'artist may only update task status';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_tasks_guard_artist_overreach on hq.tasks;
create trigger trg_tasks_guard_artist_overreach
before update on hq.tasks for each row
execute function hq.prevent_artist_task_overreach();

create or replace function hq.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_tasks_set_updated_at on hq.tasks;
create trigger trg_tasks_set_updated_at
before update on hq.tasks for each row
execute function hq.set_updated_at();

-- Baseline grants, checked by Postgres before RLS ever runs (the Phase 0
-- lesson: schema USAGE alone doesn't cover per-table access). No grants to
-- `anon` for any of these: no anon-facing use case, and no RLS policy allows
-- it, so anon gets a flat permission denial.
grant select, insert, update, delete on hq.events to authenticated;
grant select, insert, update, delete on hq.objectives to authenticated;
grant select, insert, update, delete on hq.tasks to authenticated;

-- Exposing a schema grants EXECUTE on its functions to PUBLIC by default,
-- making trigger functions callable directly as RPC endpoints. Neither needs
-- EXECUTE for the trigger itself to fire (Postgres doesn't check it against
-- the DML-issuing role), so revoking from public just closes off direct
-- invocation, same as prevent_unauthorized_role_change() in Phase 0.
revoke execute on function hq.prevent_artist_task_overreach() from public;
revoke execute on function hq.set_updated_at() from public;
