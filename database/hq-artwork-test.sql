-- Disposable CI database only; run after legacy bootstrap.
create schema hq;
grant usage on schema hq,auth to authenticated;
create table hq.profiles(id uuid primary key,display_name text,avatar text,role text,created_at timestamptz default now());
alter table hq.profiles enable row level security;
grant select,update on hq.profiles to authenticated;
create policy profile_read on hq.profiles for select to authenticated using(true);
create policy profile_update on hq.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
insert into hq.profiles(id,role) values ('00000000-0000-0000-0000-000000000001','artist'),('00000000-0000-0000-0000-000000000002','ops_admin'),('00000000-0000-0000-0000-000000000003','artist');
\ir hq-profile-role-hardening.sql
\ir hq-artwork-draft.sql
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
insert into hq.artwork_submissions(title,proposed_price_pence) values ('Test painting',1000);
do $$ begin
 begin update hq.profiles set role='super_admin' where id=auth.uid(); raise exception 'Role escalation allowed'; exception when insufficient_privilege then null; end;
 begin perform hq.review_artwork((select id from hq.artwork_submissions limit 1),'approved',''); raise exception 'Artist review allowed'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
do $$ begin if exists(select 1 from hq.artwork_submissions) then raise exception 'Artist isolation failed'; end if; end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ declare item uuid; begin
 select id into strict item from hq.artwork_submissions;
 if (select count(*) from hq.review_artwork(item,'approved','Great work'))<>1 then raise exception 'Parent review failed'; end if;
 if (select count(*) from hq.review_artwork(item,'approved','Again'))<>0 then raise exception 'Duplicate review allowed'; end if;
 if not exists(select 1 from hq.artwork_submissions where id=item and reviewed_by=auth.uid() and reviewed_at is not null and status='approved') then raise exception 'Audit failed'; end if;
end $$;
rollback;
