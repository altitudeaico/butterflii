-- Draft only. Requires integration with a securely provisioned server credential.
begin;
create role butterflii_artwork_api nologin noinherit nobypassrls;
grant usage on schema public to butterflii_artwork_api;
grant execute on function public.butterflii_resolve_hq(uuid),
 public.butterflii_list_artwork(uuid),
 public.butterflii_submit_artwork(uuid,text,text,integer),
 public.butterflii_review_artwork(uuid,uuid,text,text)
 to butterflii_artwork_api;
-- Fail closed if inherited PUBLIC grants expose existing application tables.
do $$
begin
 if exists (
 select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname not in ('pg_catalog','information_schema')
 and n.nspname not like 'pg_toast%' and n.nspname not like 'pg_temp%'
 and c.relkind in ('r','p','v','m','f')
 and (has_table_privilege('butterflii_artwork_api',c.oid,'SELECT')
 or has_table_privilege('butterflii_artwork_api',c.oid,'INSERT')
 or has_table_privilege('butterflii_artwork_api',c.oid,'UPDATE')
 or has_table_privilege('butterflii_artwork_api',c.oid,'DELETE'))
 ) then raise exception 'Restricted role has unexpected table privileges'; end if;
end $$;
commit;
-- Do not grant this role to authenticated or anon.
-- Audit PUBLIC executable functions and schema access before provisioning login.
-- No credentials or production changes are included.
