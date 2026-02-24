ALTER TABLE customizations ADD COLUMN IF NOT EXISTS support_email VARCHAR(255) NULL AFTER store_language;
ALTER TABLE customizations ADD COLUMN IF NOT EXISTS support_phone VARCHAR(50) NULL AFTER support_email;
