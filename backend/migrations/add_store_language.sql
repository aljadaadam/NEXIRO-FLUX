-- Add store_language column to customizations table
ALTER TABLE customizations ADD COLUMN store_language VARCHAR(5) DEFAULT 'ar' AFTER otp_enabled;
