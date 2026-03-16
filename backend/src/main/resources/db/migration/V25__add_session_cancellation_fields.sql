-- Add cancellation metadata to tour_session
ALTER TABLE tour_session
    ADD COLUMN cancelled_by VARCHAR(50);

ALTER TABLE tour_session
    ADD COLUMN cancelled_at TIMESTAMP;

-- Add same fields to audit table (Envers)
ALTER TABLE tour_session_aud
    ADD COLUMN cancelled_by VARCHAR(50);

ALTER TABLE tour_session_aud
    ADD COLUMN cancelled_at TIMESTAMP;