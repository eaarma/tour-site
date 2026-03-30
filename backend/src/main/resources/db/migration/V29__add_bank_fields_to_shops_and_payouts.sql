ALTER TABLE shops
ADD COLUMN bank_account_name VARCHAR(255),
ADD COLUMN bank_account_iban VARCHAR(64);

ALTER TABLE shops_aud
ADD COLUMN bank_account_name VARCHAR(255),
ADD COLUMN bank_account_iban VARCHAR(64);

ALTER TABLE payouts
ADD COLUMN bank_account_name VARCHAR(255),
ADD COLUMN bank_account_iban VARCHAR(64);

ALTER TABLE payouts_aud
ADD COLUMN bank_account_name VARCHAR(255),
ADD COLUMN bank_account_iban VARCHAR(64);
