begin;
create table hq.artwork_review_history (
 id uuid primary key default gen_random_uuid(),
 artwork_id uuid not null references hq.artwork_submissions(id),
 reviewed_by uuid not null references hq.profiles(id),
 reviewed_at timestamptz not null,
 status text not null check(status='changes_requested'),
 review_note text not null
);
alter table hq.artwork_review_history enable row level security;
revoke all on hq.artwork_review_history from public,anon,authenticated;
grant select on hq.artwork_review_history to authenticated;
create policy history_read on hq.artwork_review_history for select to authenticated using (
 exists(select 1 from hq.artwork_submissions s where s.id=artwork_id)
);
create function hq.resubmit_artwork(p_id uuid,p_title text,p_description text,p_price integer)
returns setof hq.artwork_submissions language plpgsql security definer set search_path='' as $$
declare previous hq.artwork_submissions%rowtype;
begin
 if not exists(select 1 from hq.profiles where id=auth.uid() and role='artist') then
 raise exception 'Forbidden' using errcode='42501'; end if;
 if p_title is null or length(trim(p_title)) not between 1 and 200 or p_description is null or length(p_description)>4000 or p_price is null or p_price<=0 then
 raise exception 'Invalid artwork' using errcode='22023'; end if;
 select * into previous from hq.artwork_submissions where id=p_id and artist_id=auth.uid() and status='changes_requested' for update;
 if not found then return; end if;
 insert into hq.artwork_review_history(artwork_id,reviewed_by,reviewed_at,status,review_note)
 values(previous.id,previous.reviewed_by,previous.reviewed_at,previous.status,previous.review_note);
 return query update hq.artwork_submissions s set title=trim(p_title),description=p_description,proposed_price_pence=p_price,status='pending',reviewed_by=null,reviewed_at=null,review_note=null where s.id=previous.id returning s.*;
end $$;
revoke all on function hq.resubmit_artwork(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function hq.resubmit_artwork(uuid,text,text,integer) to authenticated;
commit;
