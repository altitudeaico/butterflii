-- Staging only. Apply after submission and review hardening drafts.
begin;
create table butterflii.hq_identity_map (
 hq_user_id uuid primary key,
 member_id uuid not null unique references butterflii.members(user_id)
);
alter table butterflii.hq_identity_map enable row level security;
revoke all on butterflii.hq_identity_map from public, anon, authenticated;
-- Server-only functions use explicit verified actor IDs, not browser claims.
create function public.butterflii_resolve_hq(p_hq_user uuid)
returns table(member_id uuid, role text)
language sql security definer set search_path = ''
as $$
 select m.user_id,m.role from butterflii.hq_identity_map h
 join butterflii.members m on m.user_id=h.member_id
 where h.hq_user_id=p_hq_user;
$$;
create function public.butterflii_list_artwork(p_actor uuid)
returns setof butterflii.artwork_submissions
language sql security definer set search_path = ''
as $$
 select s.* from butterflii.artwork_submissions s
 where exists(select 1 from butterflii.members m where m.user_id=p_actor
 and (m.role='parent' or (m.role='artist' and s.artist_id=p_actor)))
 order by s.created_at desc;
$$;
create function public.butterflii_submit_artwork(p_actor uuid,p_title text,p_description text,p_price integer)
returns butterflii.artwork_submissions
language plpgsql security definer set search_path = ''
as $$
declare result butterflii.artwork_submissions;
begin
 if not exists(select 1 from butterflii.members where user_id=p_actor and role='artist') then
 raise exception 'Forbidden' using errcode='42501'; end if;
 if p_title is null or length(trim(p_title)) not between 1 and 200 or p_description is null or length(p_description)>4000 or p_price is null or p_price<=0 then
 raise exception 'Invalid artwork' using errcode='22023'; end if;
 insert into butterflii.artwork_submissions(artist_id,title,description,proposed_price_pence)
 values(p_actor,trim(p_title),p_description,p_price) returning * into result;
 return result;
end;
$$;
-- The earlier review trigger uses auth.uid(); service calls need a separate
-- reviewed design for actor attribution. Do not bypass or disable that trigger.
revoke all on function public.butterflii_resolve_hq(uuid), public.butterflii_list_artwork(uuid), public.butterflii_submit_artwork(uuid,text,text,integer) from public, anon, authenticated;
grant execute on function public.butterflii_resolve_hq(uuid), public.butterflii_list_artwork(uuid), public.butterflii_submit_artwork(uuid,text,text,integer) to service_role;
commit;
