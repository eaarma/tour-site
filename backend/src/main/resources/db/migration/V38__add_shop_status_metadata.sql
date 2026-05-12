ALTER TABLE shops
ADD COLUMN status_reason VARCHAR(1000);

ALTER TABLE shops
ADD COLUMN status_changed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE shops
ADD COLUMN status_changed_by BIGINT;

ALTER TABLE shops_aud
ADD COLUMN status_reason VARCHAR(1000);

ALTER TABLE shops_aud
ADD COLUMN status_changed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE shops_aud
ADD COLUMN status_changed_by BIGINT;