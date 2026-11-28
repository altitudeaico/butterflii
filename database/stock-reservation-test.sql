\set ON_ERROR_STOP on
BEGIN;
CREATE SCHEMA butterflii;
CREATE TABLE butterflii.products(id uuid PRIMARY KEY,slug text UNIQUE,name text,kind text,price_pence integer,status text);
CREATE TABLE butterflii.inventory(id uuid PRIMARY KEY,product_id uuid REFERENCES butterflii.products,variant text,stock integer,reserved integer DEFAULT 0,verified boolean,CHECK(reserved BETWEEN 0 AND stock),UNIQUE(product_id,variant));
CREATE TABLE butterflii.orders(id uuid PRIMARY KEY,status text,total_pence integer,shipping_pence integer,stripe_session_id text UNIQUE);
CREATE TABLE butterflii.order_items(order_id uuid REFERENCES butterflii.orders,inventory_id uuid REFERENCES butterflii.inventory,name text,quantity integer,unit_pence integer,PRIMARY KEY(order_id,inventory_id));
\ir stock-reservation-draft.sql
\ir stock-sale-draft.sql
\ir stock-cancellation-draft.sql
\ir stock-expiry-draft.sql
INSERT INTO butterflii.products VALUES ('00000000-0000-0000-0000-000000000001','art','Painting','artwork',1500,'published'),('00000000-0000-0000-0000-000000000002','mug','Mug','merchandise',1400,'published');
INSERT INTO butterflii.inventory VALUES ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','default',1,0,true),('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000002','default',3,0,true);
DO $$
BEGIN
 PERFORM butterflii.reserve_checkout('00000000-0000-0000-0000-000000000021','[{"slug":"art","quantity":1,"price_pence":1}]',500);
 IF (SELECT total_pence FROM butterflii.orders WHERE id='00000000-0000-0000-0000-000000000021') <> 2000 THEN RAISE EXCEPTION 'Wrong total'; END IF;
 BEGIN
  PERFORM butterflii.reserve_checkout('00000000-0000-0000-0000-000000000022','[{"slug":"art","quantity":1}]',0);
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Stock unavailable' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM butterflii.reserve_checkout('00000000-0000-0000-0000-000000000021','[{"slug":"mug","quantity":1}]',0);
  RAISE EXCEPTION 'Unexpected duplicate success';
 EXCEPTION WHEN unique_violation THEN NULL;
 END;
 BEGIN
  PERFORM butterflii.reserve_checkout('00000000-0000-0000-0000-000000000023','[{"slug":"mug","quantity":1},{"slug":"zzz","quantity":1}]',0);
  RAISE EXCEPTION 'Unexpected rollback success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Stock unavailable' THEN RAISE; END IF;
 END;
 IF (SELECT count(*) FROM butterflii.orders) <> 1 OR (SELECT sum(reserved) FROM butterflii.inventory) <> 1 THEN RAISE EXCEPTION 'Rollback failed'; END IF;
 IF has_function_privilege('anon','butterflii.reserve_checkout(uuid,jsonb,integer)','EXECUTE') OR has_function_privilege('authenticated','butterflii.reserve_checkout(uuid,jsonb,integer)','EXECUTE') THEN RAISE EXCEPTION 'Public execution allowed'; END IF;
END $$;
UPDATE butterflii.orders SET stripe_session_id='cs_test_fixture' WHERE id='00000000-0000-0000-0000-000000000021';
DO $$
DECLARE oid uuid := '00000000-0000-0000-0000-000000000021';
BEGIN
 BEGIN
  PERFORM butterflii.confirm_reserved_sale(oid,'cs_test_fixture',1);
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Payment mismatch' THEN RAISE; END IF;
 END;
 IF NOT butterflii.confirm_reserved_sale(oid,'cs_test_fixture',2000) THEN RAISE EXCEPTION 'Sale failed'; END IF;
 IF butterflii.confirm_reserved_sale(oid,'cs_test_fixture',2000) THEN RAISE EXCEPTION 'Duplicate sale'; END IF;
 IF NOT EXISTS (SELECT 1 FROM butterflii.orders WHERE id=oid AND status='paid') OR NOT EXISTS (SELECT 1 FROM butterflii.inventory WHERE id='00000000-0000-0000-0000-000000000011' AND stock=0 AND reserved=0) THEN RAISE EXCEPTION 'Sale state incorrect'; END IF;
 IF has_function_privilege('anon','butterflii.confirm_reserved_sale(uuid,text,integer)','EXECUTE') OR has_function_privilege('authenticated','butterflii.confirm_reserved_sale(uuid,text,integer)','EXECUTE') THEN RAISE EXCEPTION 'Public execution allowed'; END IF;
END $$;
DO $$
DECLARE oid uuid := '00000000-0000-0000-0000-000000000024';
BEGIN
 PERFORM butterflii.reserve_checkout(oid,'[{"slug":"mug","quantity":2}]',0);
 UPDATE butterflii.orders SET stripe_session_id='cs_test_cancel' WHERE id=oid;
 BEGIN
  PERFORM butterflii.cancel_reserved_order(oid,'cs_test_wrong');
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Session mismatch' THEN RAISE; END IF;
 END;
 IF NOT butterflii.cancel_reserved_order(oid,'cs_test_cancel') THEN RAISE EXCEPTION 'Cancellation failed'; END IF;
 IF butterflii.cancel_reserved_order(oid,'cs_test_cancel') THEN RAISE EXCEPTION 'Duplicate cancellation'; END IF;
 IF NOT EXISTS (SELECT 1 FROM butterflii.orders WHERE id=oid AND status='cancelled') OR NOT EXISTS (SELECT 1 FROM butterflii.inventory WHERE id='00000000-0000-0000-0000-000000000012' AND stock=3 AND reserved=0) THEN RAISE EXCEPTION 'Cancellation state incorrect'; END IF;
 BEGIN
  PERFORM butterflii.cancel_reserved_order('00000000-0000-0000-0000-000000000021','cs_test_fixture');
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Invalid order state' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM butterflii.confirm_reserved_sale(oid,'cs_test_cancel',2800);
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Invalid order state' THEN RAISE; END IF;
 END;
 IF has_function_privilege('anon','butterflii.cancel_reserved_order(uuid,text)','EXECUTE') OR has_function_privilege('authenticated','butterflii.cancel_reserved_order(uuid,text)','EXECUTE') THEN RAISE EXCEPTION 'Public execution allowed'; END IF;
END $$;
DO $$
DECLARE oid uuid := '00000000-0000-0000-0000-000000000025';
BEGIN
 PERFORM butterflii.reserve_checkout(oid,'[{"slug":"mug","quantity":2}]',0);
 UPDATE butterflii.orders SET stripe_session_id='cs_test_expiry' WHERE id=oid;
 BEGIN
  PERFORM butterflii.expire_reserved_order(oid,'cs_test_wrong');
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Session mismatch' THEN RAISE; END IF;
 END;
 IF NOT butterflii.expire_reserved_order(oid,'cs_test_expiry') THEN RAISE EXCEPTION 'Expiry failed'; END IF;
 IF butterflii.expire_reserved_order(oid,'cs_test_expiry') THEN RAISE EXCEPTION 'Duplicate expiry'; END IF;
 IF NOT EXISTS (SELECT 1 FROM butterflii.orders WHERE id=oid AND status='expired') OR NOT EXISTS (SELECT 1 FROM butterflii.inventory WHERE id='00000000-0000-0000-0000-000000000012' AND stock=3 AND reserved=0) THEN RAISE EXCEPTION 'Expiry state incorrect'; END IF;
 BEGIN
  PERFORM butterflii.expire_reserved_order('00000000-0000-0000-0000-000000000021','cs_test_fixture');
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Invalid order state' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM butterflii.confirm_reserved_sale(oid,'cs_test_expiry',2800);
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Invalid order state' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM butterflii.cancel_reserved_order(oid,'cs_test_expiry');
  RAISE EXCEPTION 'Unexpected success';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Invalid order state' THEN RAISE; END IF;
 END;
 IF has_function_privilege('anon','butterflii.expire_reserved_order(uuid,text)','EXECUTE') OR has_function_privilege('authenticated','butterflii.expire_reserved_order(uuid,text)','EXECUTE') THEN RAISE EXCEPTION 'Public execution allowed'; END IF;
END $$;
ROLLBACK;
