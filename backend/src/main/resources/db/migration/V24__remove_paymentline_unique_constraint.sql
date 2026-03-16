ALTER TABLE payment_lines
DROP CONSTRAINT IF EXISTS payment_lines_order_item_id_key;

ALTER TABLE payment_lines_aud
DROP CONSTRAINT IF EXISTS payment_lines_order_item_id_key;