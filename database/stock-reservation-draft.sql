-- Draft: run against disposable fixtures before production deployment.
CREATE FUNCTION butterflii.reserve_checkout(p_order uuid,p_items jsonb,p_shipping integer)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE item record; inv record; total bigint := p_shipping; n integer;
BEGIN
 IF p_order IS NULL OR p_shipping IS NULL OR p_shipping < 0 OR p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN RAISE EXCEPTION 'Invalid checkout'; END IF;
 n := jsonb_array_length(p_items);
 IF n < 1 OR n > 14 THEN RAISE EXCEPTION 'Invalid basket'; END IF;
 IF (SELECT count(DISTINCT x.slug) FROM jsonb_to_recordset(p_items) AS x(slug text,quantity integer)) <> n THEN RAISE EXCEPTION 'Duplicate or missing product'; END IF;
 -- Insert first: duplicate order IDs fail closed without reserving again.
 INSERT INTO butterflii.orders(id,status,total_pence,shipping_pence) VALUES(p_order,'pending',0,p_shipping);
 FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(slug text,quantity integer) ORDER BY slug COLLATE "C" LOOP
  IF item.quantity IS NULL OR item.quantity NOT BETWEEN 1 AND 10 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  SELECT i.id,i.stock,i.reserved,i.verified,p.kind,p.name,p.price_pence,p.status INTO inv
  FROM butterflii.products p JOIN butterflii.inventory i ON i.product_id=p.id
  WHERE p.slug=item.slug AND i.variant='default' FOR UPDATE OF p,i;
  IF NOT FOUND OR inv.status <> 'published' OR NOT inv.verified OR inv.stock-inv.reserved < item.quantity OR (inv.kind='artwork' AND (item.quantity<>1 OR inv.stock<>1)) THEN RAISE EXCEPTION 'Stock unavailable'; END IF;
  UPDATE butterflii.inventory SET reserved=reserved+item.quantity WHERE id=inv.id;
  INSERT INTO butterflii.order_items(order_id,inventory_id,name,quantity,unit_pence) VALUES(p_order,inv.id,inv.name,item.quantity,inv.price_pence);
  total := total + inv.price_pence::bigint * item.quantity;
 END LOOP;
 IF total > 2147483647 THEN RAISE EXCEPTION 'Invalid total'; END IF;
 UPDATE butterflii.orders SET total_pence=total::integer WHERE id=p_order;
 RETURN p_order;
END $$;
REVOKE ALL ON FUNCTION butterflii.reserve_checkout(uuid,jsonb,integer) FROM PUBLIC,anon,authenticated;
-- No runtime role granted yet. Dedicated backend permissions and payment lifecycle required.
