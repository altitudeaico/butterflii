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
commit;
-- No public access, replacement, deletion or publication grants.
-- Verify existing permissive storage policies do not bypass these restrictions before applying.
