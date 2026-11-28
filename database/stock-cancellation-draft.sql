-- Trusted backend must independently verify terminal unpaid Stripe session expiry.
-- A browser cancel redirect is NOT proof of cancellation.
CREATE FUNCTION butterflii.cancel_reserved_order(p_order uuid,p_session text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE o record; item record;
BEGIN
 IF p_order IS NULL OR p_session IS NULL OR p_session !~ '^cs_test_[A-Za-z0-9_]+$' THEN RAISE EXCEPTION 'Invalid session'; END IF;
 SELECT * INTO o FROM butterflii.orders WHERE id=p_order FOR UPDATE;
 IF NOT FOUND OR o.stripe_session_id IS DISTINCT FROM p_session THEN RAISE EXCEPTION 'Session mismatch'; END IF;
 IF o.status='cancelled' THEN RETURN false; END IF;
 IF o.status<>'pending' THEN RAISE EXCEPTION 'Invalid order state'; END IF;
 IF NOT EXISTS (SELECT 1 FROM butterflii.order_items WHERE order_id=p_order) THEN RAISE EXCEPTION 'Empty order'; END IF;
 FOR item IN SELECT oi.inventory_id,oi.quantity FROM butterflii.order_items oi JOIN butterflii.inventory i ON i.id=oi.inventory_id JOIN butterflii.products p ON p.id=i.product_id WHERE oi.order_id=p_order ORDER BY p.slug COLLATE "C",i.id LOOP
  UPDATE butterflii.inventory SET reserved=reserved-item.quantity WHERE id=item.inventory_id AND reserved>=item.quantity;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation mismatch'; END IF;
 END LOOP;
 UPDATE butterflii.orders SET status='cancelled' WHERE id=p_order;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION butterflii.cancel_reserved_order(uuid,text) FROM PUBLIC,anon,authenticated;
-- No runtime grants until payment verification is integrated.
