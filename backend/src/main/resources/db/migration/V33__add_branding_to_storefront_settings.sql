ALTER TABLE storefront_settings
    ADD COLUMN base_preset VARCHAR(30) NOT NULL DEFAULT 'SLATE',
    ADD COLUMN primary_color VARCHAR(7) NOT NULL DEFAULT '#0284c7',
    ADD COLUMN accent_color VARCHAR(7) NOT NULL DEFAULT '#f59e0b';

UPDATE storefront_settings
SET base_preset = COALESCE(base_preset, 'SLATE'),
    primary_color = COALESCE(primary_color, '#0284c7'),
    accent_color = COALESCE(accent_color, '#f59e0b');
