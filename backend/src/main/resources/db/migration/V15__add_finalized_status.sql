-- =========================================================
-- ORDERS
-- =========================================================

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (
status IN (
'PENDING',
'RESERVED',
'FINALIZED',
'EXPIRED',
'PLANNED',
'PAID',
'PARTIALLY_PAID',
'CONFIRMED',
'CANCELLED',
'CANCELLED_CONFIRMED',
'PARTIALLY_CANCELLED',
'REFUNDED',
'PARTIALLY_REFUNDED',
'COMPLETED',
'FAILED'
)
);

-- =========================================================
-- ORDERS_AUD
-- =========================================================

ALTER TABLE orders_aud
DROP CONSTRAINT IF EXISTS orders_aud_status_check;

ALTER TABLE orders_aud
ADD CONSTRAINT orders_aud_status_check
CHECK (
status IN (
'PENDING',
'RESERVED',
'FINALIZED',
'EXPIRED',
'PLANNED',
'PAID',
'PARTIALLY_PAID',
'CONFIRMED',
'CANCELLED',
'CANCELLED_CONFIRMED',
'PARTIALLY_CANCELLED',
'REFUNDED',
'PARTIALLY_REFUNDED',
'COMPLETED',
'FAILED'
)
);

-- =========================================================
-- ORDER_ITEMS
-- =========================================================

ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_status_check;

ALTER TABLE order_items
ADD CONSTRAINT order_items_status_check
CHECK (
status IN (
'PENDING',
'RESERVED',
'FINALIZED',
'EXPIRED',
'PLANNED',
'PAID',
'PARTIALLY_PAID',
'CONFIRMED',
'CANCELLED',
'CANCELLED_CONFIRMED',
'PARTIALLY_CANCELLED',
'REFUNDED',
'PARTIALLY_REFUNDED',
'COMPLETED',
'FAILED'
)
);

-- =========================================================
-- ORDER_ITEMS_AUD
-- =========================================================

ALTER TABLE order_items_aud
DROP CONSTRAINT IF EXISTS order_items_aud_status_check;

ALTER TABLE order_items_aud
ADD CONSTRAINT order_items_aud_status_check
CHECK (
status IN (
'PENDING',
'RESERVED',
'FINALIZED',
'EXPIRED',
'PLANNED',
'PAID',
'PARTIALLY_PAID',
'CONFIRMED',
'CANCELLED',
'CANCELLED_CONFIRMED',
'PARTIALLY_CANCELLED',
'REFUNDED',
'PARTIALLY_REFUNDED',
'COMPLETED',
'FAILED'
)
);