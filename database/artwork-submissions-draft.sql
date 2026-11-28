-- Build 58: draft artwork submissions, separate from published catalogue.
-- Review and test in staging before applying to production.
begin;
create table butterflii.artwork_submissions (
 id uuid primary key default gen_random_uuid(),
 artist_id uuid not null default auth.uid() references butterflii.members(user_id),
 title text not null check (length(trim(title)) between 1 and 200),
 description text not null default '',
 proposed_price_pence integer not null check (proposed_price_pence > 0),
 status text not null default 'pending' check (status in ('pending','approved','changes_requested')),
 reviewed_by uuid references butterflii.members(user_id),
 reviewed_at timestamptz,
 review_note text,
 created_at timestamptz not null default now(),
 check ((status='pending' and reviewed_by is null and reviewed_at is null) or
 (status<>'pending' and reviewed_by is not null and reviewed_at is not null))
);
alter table butterflii.artwork_submissions enable row level security;
revoke all on butterflii.artwork_submissions from public, anon, authenticated;
grant select on butterflii.artwork_submissions to authenticated;
grant insert (title,description,proposed_price_pence) on butterflii.artwork_submissions to authenticated;
grant update (status,reviewed_by,reviewed_at,review_note) on butterflii.artwork_submissions to authenticated;
create policy submission_read on butterflii.artwork_submissions for select to authenticated using (
 exists(select 1 from butterflii.members m where m.user_id=(select auth.uid()) and (m.role='parent' or (m.role='artist' and artist_id=m.user_id)))
);
create policy artist_submit on butterflii.artwork_submissions for insert to authenticated with check (
 artist_id=(select auth.uid()) and status='pending' and exists(select 1 from butterflii.members m where m.user_id=(select auth.uid()) and m.role='artist')
);
create policy parent_review on butterflii.artwork_submissions for update to authenticated using (
 status='pending' and exists(select 1 from butterflii.members m where m.user_id=(select auth.uid()) and m.role='parent')
) with check (
 status in ('approved','changes_requested') and reviewed_by=(select auth.uid()) and reviewed_at is not null and exists(select 1 from butterflii.members m where m.user_id=(select auth.uid()) and m.role='parent')
);
commit;
-- Approval deliberately does not publish, modify stock, or enable checkout.
