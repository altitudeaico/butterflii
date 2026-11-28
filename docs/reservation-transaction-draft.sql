-- Design draft for review; requires backend-schema-draft.sql.
-- Execute only through an authorised parent server workflow.
begin;
create function butterflii_private.reserve_quote(p_quote_id uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
 q butterflii_private.quotes%rowtype;
 a butterflii_private.artwork%rowtype;
begin
 select * into q from butterflii_private.quotes where id=p_quote_id;
 if not found then raise exception 'Quote not found'; end if;
 select * into a from butterflii_private.artwork where sku=q.sku for update;
 select * into q from butterflii_private.quotes where id=p_quote_id for update;
 if not found or q.sku is distinct from a.sku then raise exception 'Quote changed'; end if;
 if q.state <> 'quoted' or q.expires_at <= clock_timestamp() then
  raise exception 'Quote is not eligible for reservation';
 end if;
 if a.availability <> 'available' or not a.parent_approved or a.artist_decision <> 'sell' or a.approved_price_pence is null then
  raise exception 'Artwork is not available';
 end if;
 update butterflii_private.quotes set state='reserved' where id=p_quote_id;
 update butterflii_private.artwork set availability='reserved' where sku=a.sku;
 return p_quote_id;
end;
$$;
revoke all on function butterflii_private.reserve_quote(uuid) from public, anon, authenticated;
-- No execution grants until the trusted server role is designed and tested.
-- Test concurrent reservations, expired quotes, unapproved artwork, rollback,
-- direct client denial and quote mutation before production.
commit;
