begin;
create table hq.publication_requests (
 artwork_id uuid primary key references hq.artwork_submissions(id),
 requested_by uuid not null references hq.profiles(id),
 requested_at timestamptz not null default now(),
 price_pence integer not null check(price_pence>0),
 status text not null default 'queued' check(status in ('queued','published','failed')),
 product_id uuid unique
);
alter table hq.publication_requests enable row level security;
revoke all on hq.publication_requests from public,anon,authenticated;
grant select on hq.publication_requests to authenticated;
create policy publication_parent_read on hq.publication_requests for select to authenticated using (
 exists(select 1 from hq.profiles p where p.id=auth.uid() and p.role in ('super_admin','ops_admin'))
);
create function hq.request_publication(p_id uuid,p_price integer,p_stock_confirmed boolean)
returns setof hq.publication_requests language plpgsql security definer set search_path='' as $publication$
begin
 if not exists(select 1 from hq.profiles p where p.id=auth.uid() and p.role in ('super_admin','ops_admin')) then raise exception 'Forbidden' using errcode='42501'; end if;
 if p_price is null or p_price<=0 or p_stock_confirmed is distinct from true then raise exception 'Confirm price and physical stock' using errcode='22023'; end if;
 return query insert into hq.publication_requests(artwork_id,requested_by,price_pence)
 select s.id,auth.uid(),p_price from hq.artwork_submissions s where s.id=p_id and s.status='approved'
 and exists(select 1 from storage.objects o where o.bucket_id='butterflii-artwork-private' and o.name=s.artist_id::text||'/'||s.id::text||'/photo')
 on conflict(artwork_id) do nothing returning *;
end $publication$;
revoke all on function hq.request_publication(uuid,integer,boolean) from public,anon,authenticated;
grant execute on function hq.request_publication(uuid,integer,boolean) to authenticated;
commit;
-- Queue only: no public listing, inventory changes or photo copying.
-- Requires photo migration and separate trusted publication processor.
