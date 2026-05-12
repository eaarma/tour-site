ALTER TABLE shops
ALTER COLUMN status_changed_by TYPE UUID
USING status_changed_by::text::uuid;

ALTER TABLE shops_aud
ALTER COLUMN status_changed_by TYPE UUID
USING status_changed_by::text::uuid;