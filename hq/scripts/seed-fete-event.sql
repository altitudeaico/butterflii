-- Butterflii HQ: seed the real Delce Home Ed Summer Fete event, its six
-- objectives (plus the logistics "objective 0"), and the task plan, taken
-- directly from the fete plan document (uploaded 65e0f771-butterfliifeteplan.md).
--
-- Applied to project ypyxshljancxlvtjlpyo via the Supabase MCP tools
-- (execute_sql). Guarded to be a no-op on re-run: skips entirely if an event
-- with this name already exists.
--
-- Owner UUIDs match hq/scripts/seed-profiles.sql:
--   Owner (super_admin): 6db243b3-5569-42df-be96-a1833ce3b628
--   Funmi (ops_admin):   68df4017-63f1-489e-8574-29f40e67b61c
--   Elsie (artist):      0ad8d252-eaf6-4ec6-acbf-1b453bcb1556
--
-- Critical-path tasks (is_critical = true) are exactly the four items named
-- under "The critical path: next 48 hours" in the plan (business cards and
-- thank-you cards are two rows sharing one bullet there, so five rows total).
-- Deadlines are the literal dates from the plan (event Tuesday 21 July 2026,
-- written the week before), not shifted to "today."
-- Tasks with no single clear owner in the plan ("Everyone", "Filmer" pending
-- assignment) are left unowned (owner_id null), same as the schema allows.

do $$
declare
  owner_id uuid := '6db243b3-5569-42df-be96-a1833ce3b628';
  funmi_id uuid := '68df4017-63f1-489e-8574-29f40e67b61c';
  elsie_id uuid := '0ad8d252-eaf6-4ec6-acbf-1b453bcb1556';
  v_event_id uuid;
  v_obj0 uuid;
  v_obj1 uuid;
  v_obj2 uuid;
  v_obj3 uuid;
  v_obj4 uuid;
  v_obj5 uuid;
  v_obj6 uuid;
begin
  if exists (select 1 from hq.events where name = 'Delce Home Ed Summer Fete') then
    return;
  end if;

  insert into hq.events (name, event_date, location, sales_target, names_target, created_by)
  values ('Delce Home Ed Summer Fete', '2026-07-21', 'St Peters Church, Delce Road, Rochester', 5, 25, owner_id)
  returning id into v_event_id;

  insert into hq.objectives (event_id, title, why, sort_order)
  values (v_event_id, 'Logistics, permissions and the day',
    'If the pitch is not sorted, nothing else matters. Do this first.', 0)
  returning id into v_obj0;

  insert into hq.objectives (event_id, title, why, target, sort_order)
  values (v_event_id, 'Sales',
    'The visible goal and the scoreboard, set at a level Elsie can reach so effort is rewarded.', 5, 1)
  returning id into v_obj1;

  insert into hq.objectives (event_id, title, why, target, sort_order)
  values (v_event_id, 'The customer list',
    'The fete is one afternoon, but the list is an asset she keeps. A slow sales day is still a win if the list grows.', 25, 2)
  returning id into v_obj2;

  insert into hq.objectives (event_id, title, why, sort_order)
  values (v_event_id, 'Getting paid, and the store working',
    'The moment a buyer decides to pay is the moment you must not fumble. In person that means tap-to-pay; online it means a QR-to-checkout that works on a phone in about 30 seconds.', 3)
  returning id into v_obj3;

  insert into hq.objectives (event_id, title, why, sort_order)
  values (v_event_id, 'Delivery and customer service',
    'The sale is not the end. Good aftercare turns a one-time buyer into a repeat customer, and the follow-up email is where the list first pays off.', 4)
  returning id into v_obj4;

  insert into hq.objectives (event_id, title, why, sort_order)
  values (v_event_id, 'A strong physical presence',
    'At a small, warm community crowd, every person who stops counts, because there is no big stream behind them.', 5)
  returning id into v_obj5;

  insert into hq.objectives (event_id, title, why, sort_order)
  values (v_event_id, 'Capture the day',
    'Today''s work becomes tomorrow''s promotion, but only if someone is assigned to it while everyone else sells.', 6)
  returning id into v_obj6;

  -- Objective 0: Logistics, permissions and the day
  insert into hq.tasks (objective_id, title, owner_id, deadline, is_critical) values
    (v_obj0, 'Confirm with the organiser that a stall is allowed and booked', owner_id, '2026-07-14', true),
    (v_obj0, 'Ask the organiser if sellers need anything (permission, insurance)', owner_id, '2026-07-14', false),
    (v_obj0, 'Confirm table size, power, and set-up arrival time', owner_id, '2026-07-15', false),
    (v_obj0, 'Write the day-of running order (arrive, set up, sell 1 to 3, pack down)', owner_id, '2026-07-19', false),
    (v_obj0, 'Debrief with Elsie: review the ladder, the funnel, and what to change next time', owner_id, '2026-07-24', false);

  -- Objective 1: Sales
  insert into hq.tasks (objective_id, title, owner_id, deadline, is_critical) values
    (v_obj1, 'Decide inventory to bring, and which pieces are take-home vs order-only (with Elsie)', owner_id, '2026-07-15', false),
    (v_obj1, 'Decide how many pieces to bring, and the sell-out pivot plan (with Elsie)', owner_id, '2026-07-15', false),
    (v_obj1, 'Set on-the-day prices, including a fete special (with Elsie)', owner_id, '2026-07-18', false),
    (v_obj1, 'Make a clear price tag for every piece', elsie_id, '2026-07-18', false),
    (v_obj1, 'Prepare duplicate order slips for later orders', funmi_id, '2026-07-18', false),
    (v_obj1, 'Tell the home ed group beforehand that Elsie will have an art stall', funmi_id, '2026-07-17', false);

  -- Objective 2: The customer list
  insert into hq.tasks (objective_id, title, owner_id, deadline, is_critical) values
    (v_obj2, 'Build the lead-capture form (the Supabase piece)', owner_id, '2026-07-17', false),
    (v_obj2, 'Add a consent line at signup', owner_id, '2026-07-17', false),
    (v_obj2, 'Generate the lead-capture QR pointing to the form', owner_id, '2026-07-17', false),
    (v_obj2, 'Decide the sign-up incentive (prize draw for a small free artwork)', funmi_id, '2026-07-17', false),
    (v_obj2, 'Low-tech backup sign-up sheet or prize-draw bowl', funmi_id, '2026-07-18', false);

  -- Objective 3: Getting paid, and the store working (includes the plan's
  -- separate "Website updates for the fete" tasks, same underlying objective)
  insert into hq.tasks (objective_id, title, owner_id, deadline, is_critical) values
    (v_obj3, 'Order the card reader (SumUp or Zettle)', owner_id, '2026-07-15', true),
    (v_obj3, 'Set up the reader account and linked bank, complete verification', owner_id, '2026-07-16', false),
    (v_obj3, 'Run one real test tap to confirm money lands', owner_id, '2026-07-17', false),
    (v_obj3, 'Set the cash float: how much, what denominations', funmi_id, '2026-07-18', false),
    (v_obj3, 'Agree who holds the money and reconciles takings at the end', owner_id, '2026-07-18', false),
    (v_obj3, 'Fix the missing manifest.json and sw.js so the PWA installs', owner_id, '2026-07-16', false),
    (v_obj3, 'Put the real Web3Forms key in and confirm the commission form sends', owner_id, '2026-07-16', false),
    (v_obj3, 'Check every buy and payment link works on a phone on mobile data', owner_id, '2026-07-16', false),
    (v_obj3, 'Add the pieces she is actually bringing so the online shop matches the table', owner_id, '2026-07-17', false),
    (v_obj3, 'Make sure online prices match stall prices (or the fete special is clear)', owner_id, '2026-07-18', false),
    (v_obj3, 'Put the lead-capture form live on the site and confirm the QR reaches it', owner_id, '2026-07-17', false),
    (v_obj3, 'Optional: add a come see us at the fete note on the homepage', owner_id, '2026-07-17', false);

  -- Objective 4: Delivery and customer service
  insert into hq.tasks (objective_id, title, owner_id, deadline, is_critical) values
    (v_obj4, 'Order thank-you cards (logo plus website)', funmi_id, '2026-07-15', true),
    (v_obj4, 'Order business cards: Elsie''s brand, website, QR', funmi_id, '2026-07-15', true),
    (v_obj4, 'Buy packaging: sleeves or mailers, tissue, butterfly sticker', funmi_id, '2026-07-18', false),
    (v_obj4, 'Draft the follow-up email, ready to send fete evening', funmi_id, '2026-07-17', false),
    (v_obj4, 'Prepare simple answers for order questions', funmi_id, '2026-07-18', false);

  -- Objective 5: A strong physical presence
  insert into hq.tasks (objective_id, title, owner_id, deadline, is_critical) values
    (v_obj5, 'Order the banner', owner_id, '2026-07-15', true),
    (v_obj5, 'Clear, visible price signage so nobody has to ask (with Funmi)', elsie_id, '2026-07-18', false),
    (v_obj5, 'Rehearse Elsie''s opener line', elsie_id, '2026-07-19', false),
    (v_obj5, 'Get display stands or easels so art sits at eye level', funmi_id, '2026-07-18', false),
    (v_obj5, 'Make the branded arty magnet (sweets or stickers)', elsie_id, '2026-07-19', false),
    (v_obj5, 'Pack the setup kit (tablecloth, tape, scissors, bags, wipes, weight)', funmi_id, '2026-07-20', false),
    (v_obj5, 'Plan the stall layout as a funnel: stop, look, act, capture', owner_id, '2026-07-19', false),
    (v_obj5, 'Dry-run the full stall setup at home', null, '2026-07-20', false);

  -- Objective 6: Capture the day
  insert into hq.tasks (objective_id, title, owner_id, deadline, is_critical) values
    (v_obj6, 'Assign one filmer who is not Elsie and not on the till', owner_id, '2026-07-19', false),
    (v_obj6, 'Write the shot list', owner_id, '2026-07-19', false),
    (v_obj6, 'Charge the phone, clear storage, pack a spare battery', null, '2026-07-20', false);
end $$;
