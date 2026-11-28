-- Staging only; apply after artwork-service-draft.sql.
begin;
-- Trusted server RPC is the sole review path. Direct authenticated updates
-- are revoked; trigger continues to enforce transition and server timestamp.
revoke update (status,review_note) on butterflii.artwork_submissions from authenticated;
create or replace function butterflii.stamp_artwork_review()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
 if old.status <> 'pending' or new.status not in ('approved','changes_requested') then
   raise exception 'Invalid review transition';
 end if;
 if new.reviewed_by is null or not exists (
   select 1 from butterflii.members m where m.user_id=new.reviewed_by and m.role='parent'
 ) then raise exception 'Invalid reviewer' using errcode='42501'; end if;
 new.reviewed_at := statement_timestamp();
 return new;
end;
$$;
create function public.butterflii_review_artwork(p_actor uuid,p_id uuid,p_status text,p_note text)
returns setof butterflii.artwork_submissions
language plpgsql security definer set search_path = ''
as $$
begin
 if not exists(select 1 from butterflii.members where user_id=p_actor and role='parent') then
   raise exception 'Forbidden' using errcode='42501';
 end if;
 if p_status is null or p_status not in ('approved','changes_requested')
 or p_note is null or length(p_note)>2000
 or (p_status='changes_requested' and length(trim(p_note))=0) then
   raise exception 'Invalid review' using errcode='22023';
 end if;
 return query update butterflii.artwork_submissions s
 set status=p_status,reviewed_by=p_actor,review_note=p_note
 where s.id=p_id and s.status='pending' returning s.*;
end;
$$;
revoke all on function public.butterflii_review_artwork(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.butterflii_review_artwork(uuid,uuid,text,text) to service_role;
commit;
-- Test direct authenticated UPDATE denial, service-only EXECUTE, artist denial,
-- concurrent reviews (one winner), server timestamp, and unchanged catalogue.
-- The trusted service must derive p_actor exclusively from verified mapping.
