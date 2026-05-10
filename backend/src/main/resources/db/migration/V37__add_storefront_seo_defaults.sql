ALTER TABLE storefront_settings
    ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS seo_description VARCHAR(320),
    ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(500),
    ADD COLUMN IF NOT EXISTS og_image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS allow_indexing BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE storefront_settings
SET seo_description = 'Explore and Book Amazing Tours'
WHERE seo_description IS NULL OR BTRIM(seo_description) = '';
