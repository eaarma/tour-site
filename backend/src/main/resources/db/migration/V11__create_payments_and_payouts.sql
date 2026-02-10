-- =========================
-- PAYOUTS TABLE
-- =========================

CREATE TABLE payouts (
    id BIGSERIAL PRIMARY KEY,

    shop_id BIGINT NOT NULL,

    total_amount NUMERIC(10, 2) NOT NULL,

    status VARCHAR(50) NOT NULL,

    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version BIGINT
);

CREATE INDEX idx_payouts_shop_id
    ON payouts (shop_id);


-- =========================
-- PAYMENTS TABLE
-- =========================

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL UNIQUE,

    provider_payment_id VARCHAR(255),

    amount_total NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    shop_amount NUMERIC(10, 2) NOT NULL,

    currency VARCHAR(10) NOT NULL,

    status VARCHAR(50) NOT NULL,

    payout_id BIGINT,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version BIGINT,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_payments_payout
        FOREIGN KEY (payout_id)
        REFERENCES payouts(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_payments_payout_id
    ON payments (payout_id);