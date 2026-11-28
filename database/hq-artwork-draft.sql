-- Apply to dedicated HQ database only after testing.
begin;
create table hq.artwork_submissions (
 id uuid primary key default gen_random_uuid(),
 artist_id uuid not null default auth.uid() references hq.profiles(id),
 title text not null check(length(trim(title)) between 1 and 200),
 description text not null default '' check(length(description)<=4000),
 proposed_price_pence integer not null check(proposed_price_pence>0),
 status text not null default 'pending' check(status in ('pending','approved','changes_requested')),
 reviewed_by uuid references hq.profiles(id),
 reviewed_at timestamptz,
 review_note text check(length(review_note)<=2000),
 created_at timestamptz not null default now()
);
alter table hq.artwork_submissions enable row level security;
revoke all on hq.artwork_submissions from public,anon,authenticated;
grant select on hq.artwork_submissions to authenticated;
grant insert(title,description,proposed_price_pence) on hq.artwork_submissions to authenticated;
create policy artwork_read on hq.artwork_submissions for select to authenticated using (
 exists(select 1 from hq.profiles p where p.id=auth.uid() and (p.role in ('super_admin','ops_admin') or (p.role='artist' and artist_id=p.id)))
);
create policy artwork_submit on hq.artwork_submissions for insert to authenticated with check (
 artist_id=auth.uid() and status='pending' and exists(select 1 from hq.profiles p where p.id=auth.uid() and p.role='artist')
);
create function hq.review_artwork(p_id uuid,p_status text,p_note text)
returns setof hq.artwork_submissions language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from hq.profiles where id=auth.uid() and role in ('super_admin','ops_admin')) then
 raise exception 'Forbidden' using errcode='42501'; end if;
 if p_status is null or p_status not in ('approved','changes_requested') or p_note is null or length(p_note)>2000 or (p_status='changes_requested' and length(trim(p_note))=0) then
 raise exception 'Invalid review' using errcode='22023'; end if;
 return query update hq.artwork_submissions s set status=p_status,reviewed_by=auth.uid(),reviewed_at=statement_timestamp(),review_note=p_note where s.id=p_id and s.status='pending' returning s.*;
end $$;
revoke all on function hq.review_artwork(uuid,text,text) from public,anon,authenticated;
grant execute on function hq.review_artwork(uuid,text,text) to authenticated;
commit;
-- Verify profile role immutability and RLS before release.
