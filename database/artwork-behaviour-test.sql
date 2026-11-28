-- Disposable CI only.
begin;
insert into butterflii.members(user_id,role) values
 ('11111111-1111-4111-8111-111111111111','artist'),
 ('22222222-2222-4222-8222-222222222222','artist'),
 ('33333333-3333-4333-8333-333333333333','parent');
do $$
declare a uuid:='11111111-1111-4111-8111-111111111111'; b uuid:='22222222-2222-4222-8222-222222222222'; p uuid:='33333333-3333-4333-8333-333333333333'; s butterflii.artwork_submissions; n integer;
begin
 s:=public.butterflii_submit_artwork(a,'Test painting','Test',500);
 if s.status<>'pending' or s.artist_id<>a then raise exception 'Invalid submission'; end if;
 select count(*) into n from public.butterflii_list_artwork(b);
 if n<>0 then raise exception 'Artist isolation failed'; end if;
 select count(*) into n from public.butterflii_list_artwork(p);
 if n<>1 then raise exception 'Parent visibility failed'; end if;
 begin
 perform public.butterflii_review_artwork(a,s.id,'approved','');
 raise exception 'Artist review unexpectedly allowed';
 exception when insufficient_privilege then null;
 end;
 select count(*) into n from public.butterflii_review_artwork(p,s.id,'approved','');
 if n<>1 then raise exception 'Parent review failed'; end if;
 select count(*) into n from public.butterflii_review_artwork(p,s.id,'approved','');
 if n<>0 then raise exception 'Duplicate review allowed'; end if;
 if not exists(select 1 from butterflii.artwork_submissions where id=s.id and reviewed_by=p and reviewed_at is not null and status='approved') then raise exception 'Review attribution failed'; end if;
end $$;
rollback;
