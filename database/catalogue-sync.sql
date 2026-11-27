create function butterflii.refresh_catalogue() returns trigger language plpgsql security invoker set search_path = '' as $$
declare pid uuid;
begin
 if TG_TABLE_NAME='products' then
   if TG_OP='DELETE' then delete from public.butterflii_catalogue where slug=OLD.slug; return OLD; end if;
   pid:=NEW.id;
   if TG_OP='UPDATE' and OLD.slug<>NEW.slug then delete from public.butterflii_catalogue where slug=OLD.slug; end if;
 else
   if TG_OP='DELETE' then pid:=OLD.product_id; else pid:=NEW.product_id; end if;
   if TG_OP='UPDATE' and OLD.product_id<>NEW.product_id then raise exception 'Inventory product cannot be reassigned'; end if;
 end if;
 delete from public.butterflii_catalogue c using butterflii.products p where p.id=pid and c.slug=p.slug and p.status<>'published';
 insert into public.butterflii_catalogue(slug,name,description,kind,medium,image_path,price_pence,available)
 select p.slug,p.name,p.description,p.kind,p.medium,p.image_path,p.price_pence,exists(select 1 from butterflii.inventory i where i.product_id=p.id and i.verified and i.stock>i.reserved)
 from butterflii.products p where p.id=pid and p.status='published'
 on conflict(slug) do update set name=excluded.name,description=excluded.description,kind=excluded.kind,medium=excluded.medium,image_path=excluded.image_path,price_pence=excluded.price_pence,available=excluded.available;
 if TG_OP='DELETE' then return OLD; end if; return NEW;
end $$;
revoke all on function butterflii.refresh_catalogue() from public,anon,authenticated;
create trigger butterflii_product_sync after insert or update or delete on butterflii.products for each row execute function butterflii.refresh_catalogue();
create trigger butterflii_inventory_sync after insert or update or delete on butterflii.inventory for each row execute function butterflii.refresh_catalogue();
update butterflii.products set status='published' where slug in (select slug from public.butterflii_catalogue);
