-- DESIGN DRAFT ONLY. Not a migration. Do not execute against an existing project.
begin;
create schema butterflii_private;
revoke all on schema butterflii_private from public, anon, authenticated;
create table butterflii_private.artwork (
 sku text primary key check (sku ~ '^[a-z0-9-]+$'),
 title text not null,
 description text not null,
 image_path text not null,
 proposed_price_pence integer check (proposed_price_pence > 0),
 approved_price_pence integer check (approved_price_pence > 0),
 artist_decision text not null default 'pending' check (artist_decision in ('pending','sell','display','exclude')),
 parent_approved boolean not null default false,
 availability text not null default 'pending-review' check (availability in ('pending-review','available','reserved','sold','display')),
 check (availability <> 'available' or (parent_approved and artist_decision='sell' and approved_price_pence is not null))
);
create table butterflii_private.quotes (
 id uuid primary key default gen_random_uuid(),
 sku text not null references butterflii_private.artwork(sku),
 artwork_pence integer not null check (artwork_pence > 0),
 delivery_pence integer not null check (delivery_pence >= 0),
 total_pence bigint generated always as (artwork_pence::bigint + delivery_pence::bigint) stored,
 destination_region text not null,
 expires_at timestamptz not null,
 state text not null default 'quoted' check (state in ('quoted','reserved','paid','dispatched','cancelled','refunded')),
 payment_reference text unique,
 created_at timestamptz not null default now()
);
-- A refunded original remains blocked until a parent verifies its physical return.
create unique index one_active_original on butterflii_private.quotes(sku)
 where state in ('reserved','paid','dispatched','refunded');
alter table butterflii_private.artwork enable row level security;
alter table butterflii_private.quotes enable row level security;
revoke all on all tables in schema butterflii_private from public, anon, authenticated;
-- No client policies or grants until authenticated server workflows are implemented.
-- Reservation transaction must lock artwork, validate approval/availability/expiry,
-- insert or update quote, and update artwork status atomically.
-- Payment state must be verified server-side; no client-supplied payment confirmation.
commit;
