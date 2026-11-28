-- Design draft. Apply after schema, reservation, cancellation and payment drafts.
-- Not tested or deployed. Trusted server only.
begin;
create function butterflii_private.begin_payment_attempt(p_quote uuid)
returns uuid language plpgsql security invoker set search_path='' as $$
declare q butterflii_private.quotes%rowtype; a butterflii_private.artwork%rowtype; attempt uuid;
begin
 select * into strict q from butterflii_private.quotes where id=p_quote;
 select * into strict a from butterflii_private.artwork where sku=q.sku for update;
 select * into strict q from butterflii_private.quotes where id=p_quote for update;
 if q.sku is distinct from a.sku or q.state <> 'reserved' or a.availability <> 'reserved' or q.expires_at <= clock_timestamp() then raise exception 'Quote not eligible'; end if;
 insert into butterflii_private.payment_attempts(quote_id) values(p_quote)
 on conflict(quote_id) do nothing returning id into attempt;
 if attempt is null then
 select id into strict attempt from butterflii_private.payment_attempts where quote_id=p_quote and state='creating';
 end if;
 return attempt;
end;
$$;
revoke all on function butterflii_private.begin_payment_attempt(uuid) from public, anon, authenticated;
create or replace function butterflii_private.cancel_unpaid_quote(p_quote_id uuid)
returns uuid language plpgsql security invoker set search_path='' as $$
declare q butterflii_private.quotes%rowtype; a butterflii_private.artwork%rowtype;
begin
 select * into strict q from butterflii_private.quotes where id=p_quote_id;
 select * into strict a from butterflii_private.artwork where sku=q.sku for update;
 select * into strict q from butterflii_private.quotes where id=p_quote_id for update;
 if q.sku is distinct from a.sku or q.state not in ('quoted','reserved') then raise exception 'Manual review required'; end if;
 if q.payment_reference is not null or exists(select 1 from butterflii_private.payment_attempts where quote_id=q.id) then raise exception 'Payment reconciliation required'; end if;
 if q.state='reserved' then
 if a.availability <> 'reserved' then raise exception 'Inventory mismatch'; end if;
 update butterflii_private.artwork set availability='pending-review' where sku=a.sku;
 end if;
 update butterflii_private.quotes set state='cancelled' where id=q.id;
 return q.id;
end;
$$;
revoke all on function butterflii_private.cancel_unpaid_quote(uuid) from public, anon, authenticated;
-- Server must commit attempt before calling Stripe, use attempt UUID as stable
-- idempotency key, and reconcile ambiguous responses. Never retry with a fresh
-- key after an uncertain response. Any attempt blocks automatic cancellation,
-- including void attempts, until a separate verified reconciliation is built.
commit;
