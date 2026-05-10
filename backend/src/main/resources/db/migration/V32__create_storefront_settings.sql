CREATE TABLE storefront_settings (
    id BIGSERIAL PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(320),
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO storefront_settings (site_name)
VALUES ('TourHub');
