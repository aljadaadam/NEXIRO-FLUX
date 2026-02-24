-- Add email, currency, OTP settings to customizations table
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255) NULL;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_port INT NULL;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255) NULL;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_pass VARCHAR(255) NULL;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS smtp_from VARCHAR(255) NULL;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS secondary_currency VARCHAR(10) NULL;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS currency_rate DECIMAL(12, 4) NULL;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS otp_enabled TINYINT(1) DEFAULT 0;
