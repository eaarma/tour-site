ALTER TABLE payment_lines
    DROP CONSTRAINT IF EXISTS uk_payment_lines_order_item;

ALTER TABLE payment_lines
    ALTER COLUMN order_item_id DROP NOT NULL;

ALTER TABLE payment_lines
    ADD COLUMN type VARCHAR(50);

UPDATE payment_lines
SET type = 'SALE'
WHERE type IS NULL;

ALTER TABLE payment_lines
    ALTER COLUMN type SET NOT NULL;

ALTER TABLE payment_lines_aud
ADD COLUMN type VARCHAR(50);

UPDATE payment_lines_aud
SET type = 'SALE'
WHERE type IS NULL;

ALTER TABLE payment_lines_aud
ALTER COLUMN type SET NOT NULL;