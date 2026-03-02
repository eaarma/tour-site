-- V19__cancellation_reason_type_and_length.sql

-- ================================
-- MAIN TABLE: order_items
-- ================================

-- 1) Increase cancellation_reason length to 500
ALTER TABLE order_items
    ALTER COLUMN cancellation_reason TYPE VARCHAR(500);

-- 2) Add cancellation_reason_type column
ALTER TABLE order_items
    ADD COLUMN cancellation_reason_type VARCHAR(50);

-- ================================
-- AUDIT TABLE: order_items_aud
-- ================================

-- 3) Increase cancellation_reason length in audit table
ALTER TABLE order_items_aud
    ALTER COLUMN cancellation_reason TYPE VARCHAR(500);

-- 4) Add cancellation_reason_type column to audit table
ALTER TABLE order_items_aud
    ADD COLUMN cancellation_reason_type VARCHAR(50);