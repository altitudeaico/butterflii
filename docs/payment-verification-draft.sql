-- Design draft only; requires backend-schema-draft.sql.
-- No Stripe calls, credentials or live deployment.
begin;
create table butterflii_private.payment_attempts (
 id uuid primary key default gen_random_uuid(),
 quote_id uuid not null unique references butterflii_private.quotes(id),
 stripe_invoice_id text unique,
 state text not null default 'creating' check(state in ('creating','open','verified-paid','void','review')),
 created_at timestamptz not null default now()
);
create table butterflii_private.payment_events (
 event_id text primary key,
 attempt_id uuid not null references butterflii_private.payment_attempts(id),
 received_at timestamptz not null default now()
);
alter table butterflii_private.payment_attempts enable row level security;
alter table butterflii_private.payment_events enable row level security;
revoke all on butterflii_private.payment_attempts, butterflii_private.payment_events from public, anon, authenticated;
create function butterflii_private.record_verified_payment(p_quote uuid,p_invoice text,p_event text,p_amount bigint,p_currency text)
returns void language plpgsql security invoker set search_path='' as $$
declare q butterflii_private.quotes%rowtype; a butterflii_private.artwork%rowtype; t butterflii_private.payment_attempts%rowtype;
begin
 select * into strict q from butterflii_private.quotes where id=p_quote;
 select * into strict a from butterflii_private.artwork where sku=q.sku for update;
 select * into strict q from butterflii_private.quotes where id=p_quote for update;
 select * into strict t from butterflii_private.payment_attempts where quote_id=p_quote for update;
 if q.sku is distinct from a.sku or t.stripe_invoice_id is distinct from p_invoice or p_invoice is null or p_event is null or p_currency is distinct from 'gbp' or p_amount is distinct from q.total_pence then raise exception 'Payment mismatch'; end if;
 if exists(select 1 from butterflii_private.payment_events where event_id=p_event and attempt_id=t.id) then return; end if;
 if t.state='verified-paid' and q.state in ('paid','dispatched') then
  insert into butterflii_private.payment_events(event_id,attempt_id) values(p_event,t.id); return;
 end if;
 if q.state <> 'reserved' or a.availability <> 'reserved' or t.state <> 'open' then raise exception 'Manual reconciliation required'; end if;
 insert into butterflii_private.payment_events(event_id,attempt_id) values(p_event,t.id);
 update butterflii_private.payment_attempts set state='verified-paid' where id=t.id;
 update butterflii_private.quotes set state='paid',payment_reference=p_invoice where id=q.id;
 update butterflii_private.artwork set availability='sold' where sku=a.sku;
end;
$$;
revoke all on function butterflii_private.record_verified_payment(uuid,text,text,bigint,text) from public, anon, authenticated;
-- Server must independently verify Stripe signature, account, live/test mode,
-- invoice identity, currency, amount and actual settled payment (not merely marked paid).
-- Create durable attempt BEFORE external invoice creation; use stable idempotency key.
-- Previous cancellation draft MUST be revised to check attempts, not just payment_reference.
-- Do not deploy either workflow until integrated and tested together.
commit;
