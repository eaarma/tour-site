CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens_aud (
    id UUID,
    rev BIGINT NOT NULL,
    revtype SMALLINT,
    token VARCHAR(255),
    user_id UUID,
    expires_at TIMESTAMP,
    PRIMARY KEY (id, rev)
);