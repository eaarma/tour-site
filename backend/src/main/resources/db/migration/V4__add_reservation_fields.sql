-- =========================================
-- Add reservation support to booking system
-- =========================================

-- ---- Main tables ----

ALTER TABLE tour_schedules
ADD COLUMN reserved_participants INTEGER NOT NULL DEFAULT 0;

ALTER TABLE orders
ADD COLUMN expires_at TIMESTAMP NULL;

-- ---- Envers audit tables ----

ALTER TABLE tour_schedules_aud
ADD COLUMN reserved_participants INTEGER;

ALTER TABLE orders_aud
ADD COLUMN expires_at TIMESTAMP;

-- ---- Performance index ----

CREATE INDEX IF NOT EXISTS idx_orders_reserved_expiration
ON orders (status, expires_at);
"