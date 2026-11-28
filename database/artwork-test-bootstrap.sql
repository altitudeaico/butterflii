-- Disposable CI database only. Never execute on Family OS.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create schema butterflii;
create table butterflii.members(user_id uuid primary key, role text not null check(role in ('artist','parent')));
grant usage on schema butterflii,auth to authenticated,service_role;
grant select on butterflii.members to authenticated;
