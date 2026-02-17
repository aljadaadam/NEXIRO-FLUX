ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255) NULL AFTER social_links;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_port INT NULL AFTER smtp_host;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255) NULL AFTER smtp_port;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_pass VARCHAR(255) NULL AFTER smtp_user;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_from VARCHAR(255) NULL AFTER smtp_pass;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS secondary_currency VARCHAR(10) NULL AFTER smtp_from;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS currency_rate DECIMAL(12,4) NULL AFTER secondary_currency;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS otp_enabled TINYINT(1) DEFAULT 0 AFTER currency_rate;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS store_language VARCHAR(5) DEFAULT 'ar' AFTER otp_enabled;
