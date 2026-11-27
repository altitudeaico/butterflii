create table public.butterflii_catalogue (
 slug text primary key, name text not null, description text not null default '', kind text not null check(kind in ('artwork','merchandise')), medium text, image_path text, price_pence integer not null check(price_pence>0), available boolean not null default false
);
alter table public.butterflii_catalogue enable row level security;
revoke all on public.butterflii_catalogue from public,anon,authenticated;
grant select on public.butterflii_catalogue to anon,authenticated;
create policy butterflii_catalogue_read on public.butterflii_catalogue for select to anon,authenticated using (true);
grant select,insert,update,delete on public.butterflii_catalogue to service_role;
insert into public.butterflii_catalogue(slug,name,description,kind,medium,image_path,price_pence,available)
select slug,name,description,kind,medium,image_path,price_pence,false from butterflii.products;