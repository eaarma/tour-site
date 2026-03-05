-- ================================
-- Add email_verified column to users
-- ================================

ALTER TABLE users
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;



-- ================================
-- Email verification tokens table
-- ================================

CREATE TABLE email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,

    token VARCHAR(64) NOT NULL UNIQUE,

    user_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT now(),

    expires_at TIMESTAMP NOT NULL,

    used BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_email_verification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ================================
-- Envers audit table
-- ================================

CREATE TABLE email_verification_tokens_aud (
    id BIGINT NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,

    token VARCHAR(64),
    user_id UUID,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    used BOOLEAN,

    PRIMARY KEY (id, rev)
);


-- ================================
-- Audit foreign keys
-- ================================

ALTER TABLE email_verification_tokens_aud
ADD CONSTRAINT fk_email_verification_aud_rev
FOREIGN KEY (rev)
REFERENCES revinfo (rev);