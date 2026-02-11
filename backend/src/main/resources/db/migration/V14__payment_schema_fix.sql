-- =========================
-- V14: Align audit tables after Payment refactor
-- =========================

-- 1) payments_aud: remove columns that no longer exist on Payment entity
ALTER TABLE payments_aud
    DROP COLUMN IF EXISTS payout_id;

ALTER TABLE payments_aud
    DROP COLUMN IF EXISTS shop_amount;


-- 2) optional but consistent: add audit index for payment_lines_aud rev
-- (helps history lookups, and matches your style in V12)
CREATE INDEX IF NOT EXISTS idx_payment_lines_aud_rev
    ON payment_lines_aud (rev);