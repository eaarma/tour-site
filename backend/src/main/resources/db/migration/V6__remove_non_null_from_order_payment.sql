ALTER TABLE orders
ALTER COLUMN payment_method DROP NOT NULL;

ALTER TABLE orders_aud
ALTER COLUMN payment_method DROP NOT NULL;

