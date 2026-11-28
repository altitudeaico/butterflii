-- Draft: apply only after restricted role migration; requires server transport change.
begin;
create schema butterflii_api;
revoke all on schema butterflii_api from public, anon, authenticated;
grant usage on schema butterflii_api to butterflii_artwork_api;
alter function public.butterflii_resolve_hq(uuid) set schema butterflii_api;
alter function public.butterflii_list_artwork(uuid) set schema butterflii_api;
alter function public.butterflii_submit_artwork(uuid,text,text,integer) set schema butterflii_api;
alter function public.butterflii_review_artwork(uuid,uuid,text,text) set schema butterflii_api;
revoke usage on schema public from butterflii_artwork_api;
-- PUBLIC schema privileges may still apply. Abort rather than change shared grants.
do $$
begin
 if has_schema_privilege('butterflii_artwork_api','public','USAGE') then
 raise exception 'Shared PUBLIC schema usage remains; isolation not established';
 end if;
end $$;
commit;
-- Never revoke shared PUBLIC privileges without a separate dependency review.
-- Dedicated server transport and full effective privilege audit required.
