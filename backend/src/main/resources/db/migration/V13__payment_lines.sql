-- =========================
-- PAYMENT LINES
-- =========================
CREATE TABLE payment_lines (
    id BIGSERIAL PRIMARY KEY,

    payment_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL UNIQUE,

    shop_id BIGINT NOT NULL,

    gross_amount NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL,
    shop_amount NUMERIC(10,2) NOT NULL,

    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,

    payout_id BIGINT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    version BIGINT,

    CONSTRAINT fk_payment_lines_payment
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,

    CONSTRAINT fk_payment_lines_order_item
        FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,

    CONSTRAINT fk_payment_lines_payout
        FOREIGN KEY (payout_id) REFERENCES payouts(id) ON DELETE SET NULL
);

CREATE INDEX idx_payment_lines_shop_id ON payment_lines(shop_id);
CREATE INDEX idx_payment_lines_payout_id ON payment_lines(payout_id);
CREATE INDEX idx_payment_lines_payment_id ON payment_lines(payment_id);


-- =========================
-- ENVERS AUDIT
-- =========================
CREATE TABLE payment_lines_aud (
    id BIGINT NOT NULL,
    rev BIGINT NOT NULL,
    revtype SMALLINT,

    payment_id BIGINT,
    order_item_id BIGINT,
    shop_id BIGINT,

    gross_amount NUMERIC(10,2),
    platform_fee NUMERIC(10,2),
    shop_amount NUMERIC(10,2),

    currency VARCHAR(10),
    status VARCHAR(50),

    payout_id BIGINT,

    created_at TIMESTAMP WITH TIME ZONE,

    version BIGINT,

    PRIMARY KEY (id, rev)
);


-- =========================
-- CLEAN UP PAYMENTS (recommended)
-- =========================
-- payouts belong to lines, not payment
ALTER TABLE payments DROP COLUMN IF EXISTS payout_id;

-- shop_amount at payment-level becomes misleading (multi-shop)
ALTER TABLE payments DROP COLUMN IF EXISTS shop_amount;
