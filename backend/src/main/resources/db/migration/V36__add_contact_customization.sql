ALTER TABLE storefront_settings
    ADD COLUMN IF NOT EXISTS contact_receiver_email VARCHAR(320),
    ADD COLUMN IF NOT EXISTS support_phone VARCHAR(40),
    ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(255),
    ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(255),
    ADD COLUMN IF NOT EXISTS city VARCHAR(120),
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(40),
    ADD COLUMN IF NOT EXISTS country VARCHAR(120),
    ADD COLUMN IF NOT EXISTS business_hours VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS show_contact_email BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS show_support_phone BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS show_address BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS show_business_hours BOOLEAN NOT NULL DEFAULT TRUE;

INSERT INTO store_pages (
    slug,
    eyebrow,
    title,
    description,
    content_json,
    closing_note
) VALUES (
    'contact',
    '{{siteName}}',
    'Get in touch',
    'We''d love to hear from you. Whether you have a question about our tours, booking, or just want help choosing the right experience, feel free to reach out.',
    $${
      "detailsTitle": "Contact details",
      "detailsDescription": "Use the information below for direct support or send us a message through the form.",
      "bestForTitle": "Best for",
      "bestForDescription": "Questions about tours, booking guidance, availability, or help choosing between experiences.",
      "messageTitle": "Message",
      "messageDescription": "Send a note and we'll get back to you as soon as we can.",
      "emptyDetailsMessage": "Contact details have not been configured yet. You can still use the form and the message will be sent through the site contact route.",
      "submitButtonLabel": "Send"
    }$$,
    'We usually recommend including the tour name, date, and any special questions so it''s easier to help you quickly.'
)
ON CONFLICT (slug) DO NOTHING;
