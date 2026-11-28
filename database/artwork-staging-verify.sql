-- Run after the four artwork migrations in an isolated staging database.
begin;
do $$
declare r text; f text;
begin
 if not (select relrowsecurity from pg_class where oid='butterflii.artwork_submissions'::regclass) then raise exception 'Submission RLS disabled'; end if;
 if not (select relrowsecurity from pg_class where oid='butterflii.hq_identity_map'::regclass) then raise exception 'Mapping RLS disabled'; end if;
 foreach r in array array['anon','authenticated'] loop
  if has_table_privilege(r,'butterflii.hq_identity_map','SELECT') then raise exception 'Mapping readable by %',r; end if;
  if has_any_column_privilege(r,'butterflii.artwork_submissions','UPDATE') then raise exception 'Direct review permitted for %',r; end if;
  foreach f in array array['public.butterflii_resolve_hq(uuid)','public.butterflii_list_artwork(uuid)','public.butterflii_submit_artwork(uuid,text,text,integer)','public.butterflii_review_artwork(uuid,uuid,text,text)'] loop
   if has_function_privilege(r,f,'EXECUTE') then raise exception 'RPC % exposed to %',f,r; end if;
   if not has_function_privilege('service_role',f,'EXECUTE') then raise exception 'Missing server grant: %',f; end if;
  end loop;
 end loop;
 if not exists(select 1 from pg_trigger where tgrelid='butterflii.artwork_submissions'::regclass and not tgisinternal and tgenabled in ('O','A') and tgfoid='butterflii.stamp_artwork_review()'::regprocedure) then raise exception 'Review trigger missing or disabled'; end if;
end $$;
select 'Artwork privilege checks passed' as result;
rollback;
