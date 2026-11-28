begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('butterflii-artwork-private','butterflii-artwork-private',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy butterflii_photo_insert on storage.objects for insert to authenticated with check (
 bucket_id='butterflii-artwork-private'
 and exists(select 1 from hq.artwork_submissions s join hq.profiles p on p.id=s.artist_id
 where p.id=auth.uid() and p.role='artist' and s.status='pending'
 and name=s.artist_id::text||'/'||s.id::text||'/photo')
);
create policy butterflii_photo_read on storage.objects for select to authenticated using (
 bucket_id='butterflii-artwork-private'
 and exists(select 1 from hq.artwork_submissions s
 where name=s.artist_id::text||'/'||s.id::text||'/photo'
 and exists(select 1 from hq.profiles p where p.id=auth.uid()
 and (p.role in ('super_admin','ops_admin') or (p.role='artist' and p.id=s.artist_id))))
);
create function hq.require_artwork_photo() returns trigger language plpgsql security definer set search_path='' as $photo$
begin
 if new.status='approved' and old.status is distinct from new.status and not exists(
 select 1 from storage.objects o where o.bucket_id='butterflii-artwork-private' and o.name=new.artist_id::text||'/'||new.id::text||'/photo'
 ) then raise exception 'Attach a photo before approval' using errcode='23514'; end if;
 return new;
end $photo$;
revoke all on function hq.require_artwork_photo() from public,anon,authenticated;
create trigger require_artwork_photo before update of status on hq.artwork_submissions for each row execute function hq.require_artwork_photo();
commit;
-- No public access, replacement, deletion or publication grants.
-- Verify existing permissive storage policies do not bypass these restrictions before applying.
