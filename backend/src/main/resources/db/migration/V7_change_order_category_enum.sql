-- Drop existing constraint
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Recreate with RESERVED included
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN (
    'RESERVED',
    'PENDING',
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
));

ALTER TABLE orders_aud
DROP CONSTRAINT IF EXISTS orders_aud_status_check;

ALTER TABLE orders_aud
ADD CONSTRAINT orders_aud_status_check
CHECK (status IN (
    'RESERVED',
    'PENDING',
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
));

