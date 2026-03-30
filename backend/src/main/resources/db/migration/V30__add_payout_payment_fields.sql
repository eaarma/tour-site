ALTER TABLE payouts
ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN currency VARCHAR(10),
ADD COLUMN method VARCHAR(50),
ADD COLUMN reference VARCHAR(255),
ADD COLUMN notes TEXT,
ADD COLUMN transaction_count INTEGER;

UPDATE payouts
SET currency = 'EUR'
WHERE currency IS NULL;

UPDATE payouts
SET method = 'OTHER'
WHERE method IS NULL;

UPDATE payouts
SET transaction_count = 0
WHERE transaction_count IS NULL;

ALTER TABLE payouts
ALTER COLUMN currency SET NOT NULL,
ALTER COLUMN method SET NOT NULL,
ALTER COLUMN transaction_count SET NOT NULL;

ALTER TABLE payouts_aud
ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN currency VARCHAR(10),
ADD COLUMN method VARCHAR(50),
ADD COLUMN reference VARCHAR(255),
ADD COLUMN notes TEXT,
ADD COLUMN transaction_count INTEGER;
