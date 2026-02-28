-- ============================
-- ORDERS TABLE
-- ============================

ALTER TABLE orders
    ADD COLUMN cancellation_token_hash VARCHAR(64);

ALTER TABLE orders
    ADD COLUMN cancellation_token_expires_at TIMESTAMP;

CREATE INDEX idx_orders_cancellation_token_hash
    ON orders (cancellation_token_hash);


-- ============================
-- ORDER_ITEMS TABLE
-- ============================

ALTER TABLE order_items
    ADD COLUMN cancelled_at TIMESTAMP;

ALTER TABLE order_items
    ADD COLUMN cancellation_reason TEXT;

ALTER TABLE order_items
    ADD COLUMN cancelled_by VARCHAR(20);


-- ============================
-- AUDIT TABLES (ENVERS)
-- ============================

ALTER TABLE orders_aud
    ADD COLUMN cancellation_token_hash VARCHAR(64);

ALTER TABLE orders_aud
    ADD COLUMN cancellation_token_expires_at TIMESTAMP;


ALTER TABLE order_items_aud
    ADD COLUMN cancelled_at TIMESTAMP;

ALTER TABLE order_items_aud
    ADD COLUMN cancellation_reason TEXT;

ALTER TABLE order_items_aud
    ADD COLUMN cancelled_by VARCHAR(20);