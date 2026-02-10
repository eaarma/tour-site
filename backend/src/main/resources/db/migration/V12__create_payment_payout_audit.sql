-- =========================
-- PAYMENTS AUDIT TABLE
-- =========================

CREATE TABLE payments_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL,
    revtype SMALLINT,

    order_id BIGINT,
    provider_payment_id VARCHAR(255),
    amount_total NUMERIC(10, 2),
    platform_fee NUMERIC(10, 2),
    shop_amount NUMERIC(10, 2),
    currency VARCHAR(10),
    status VARCHAR(50),
    payout_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    version BIGINT,

    PRIMARY KEY (id, rev)
);

CREATE INDEX idx_payments_aud_rev
    ON payments_aud (rev);


-- =========================
-- PAYOUTS AUDIT TABLE
-- =========================

CREATE TABLE payouts_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL,
    revtype SMALLINT,

    shop_id BIGINT,
    total_amount NUMERIC(10, 2),
    status VARCHAR(50),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    version BIGINT,

    PRIMARY KEY (id, rev)
);

CREATE INDEX idx_payouts_aud_rev
    ON payouts_aud (rev);
