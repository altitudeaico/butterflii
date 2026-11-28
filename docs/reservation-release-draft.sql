-- Design draft only. Requires backend-schema-draft.sql.
-- Trusted parent server workflow only. No public execution.
begin;
create function butterflii_private.cancel_unpaid_quote(p_quote_id uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
 q butterflii_private.quotes%rowtype;
 a butterflii_private.artwork%rowtype;
begin
 select * into q from butterflii_private.quotes where id=p_quote_id;
 if not found then raise exception 'Quote not found'; end if;
 select * into a from butterflii_private.artwork where sku=q.sku for update;
 if not found then raise exception 'Artwork not found'; end if;
 select * into q from butterflii_private.quotes where id=p_quote_id for update;
 if not found or q.sku is distinct from a.sku then raise exception 'Quote changed'; end if;
 if q.state not in ('quoted','reserved') then raise exception 'Manual review required'; end if;
 -- Fail closed if any payment reference exists. A separate verified
 -- Stripe reconciliation workflow must handle those cancellations.
 if q.payment_reference is not null then raise exception 'Payment reconciliation required'; end if;
 if q.state='reserved' then
  if a.availability <> 'reserved' then raise exception 'Inventory mismatch'; end if;
  -- Release into review, not directly into saleable inventory.
  update butterflii_private.artwork set availability='pending-review' where sku=a.sku;
 end if;
 update butterflii_private.quotes set state='cancelled' where id=p_quote_id;
 return p_quote_id;
end;
$$;
revoke all on function butterflii_private.cancel_unpaid_quote(uuid) from public, anon, authenticated;
-- Required before use: durable payment-request creation state, idempotency,
-- server-side authorization, audit history, and concurrency tests.
-- A null payment reference alone is not proof that Stripe has no payment
-- request; do not enable this workflow until creation/reconciliation is integrated.
-- Refunds and returns remain blocked pending physical inspection.
commit;
