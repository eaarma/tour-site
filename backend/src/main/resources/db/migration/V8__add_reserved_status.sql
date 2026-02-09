-- =========================
-- ORDERS
-- =========================
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (
    status IN (
        'PENDING',
        'RESERVED',
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

-- =========================
-- ORDER ITEMS
-- =========================
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_status_check;

ALTER TABLE order_items
ADD CONSTRAINT order_items_status_check
CHECK (
    status IN (
        'PENDING',
        'RESERVED',
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

-- =========================
-- ORDERS_AUD (Envers)
-- Only run if table exists
-- =========================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'orders_aud'
    ) THEN
        EXECUTE 'ALTER TABLE orders_aud DROP CONSTRAINT IF EXISTS orders_aud_status_check';

        EXECUTE $sql$
            ALTER TABLE orders_aud
            ADD CONSTRAINT orders_aud_status_check
            CHECK (
                status IN (
                    'PENDING',
                    'RESERVED',
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
            )
        $sql$;
    END IF;
END $$;

-- =========================
-- ORDER_ITEMS_AUD (Envers)
-- Only run if table exists
-- =========================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'order_items_aud'
    ) THEN
        EXECUTE 'ALTER TABLE order_items_aud DROP CONSTRAINT IF EXISTS order_items_aud_status_check';

        EXECUTE $sql$
            ALTER TABLE order_items_aud
            ADD CONSTRAINT order_items_aud_status_check
            CHECK (
                status IN (
                    'PENDING',
                    'RESERVED',
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
            )
        $sql$;
    END IF;
END $$;
