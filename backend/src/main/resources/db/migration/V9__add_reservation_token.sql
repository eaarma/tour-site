ALTER TABLE orders
ADD COLUMN reservation_token VARCHAR(64);

ALTER TABLE orders_aud
ADD COLUMN reservation_token VARCHAR(64);

CREATE UNIQUE INDEX ux_orders_reservation_token
ON orders(reservation_token)
WHERE reservation_token IS NOT NULL;
