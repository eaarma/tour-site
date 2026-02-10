ALTER TABLE orders
ALTER COLUMN reservation_token
TYPE UUID
USING reservation_token::uuid;


ALTER TABLE orders_aud
ALTER COLUMN reservation_token
TYPE UUID
USING reservation_token::uuid;

