-- Allow payment_lines without a payment (session fees, payouts, etc.)
ALTER TABLE payment_lines
ALTER COLUMN payment_id DROP NOT NULL;

ALTER TABLE payment_lines_aud
ALTER COLUMN payment_id DROP NOT NULL;


-- Add session reference
ALTER TABLE payment_lines
ADD COLUMN session_id BIGINT;

ALTER TABLE payment_lines_aud
ADD COLUMN session_id BIGINT;


-- Foreign key for session reference
ALTER TABLE payment_lines
ADD CONSTRAINT fk_payment_lines_session
FOREIGN KEY (session_id)
REFERENCES tour_session(id);


-- Optional but recommended index for reporting
CREATE INDEX idx_payment_lines_session_id
ON payment_lines(session_id);