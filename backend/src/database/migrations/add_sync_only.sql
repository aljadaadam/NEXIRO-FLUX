-- إضافة حقل sync_only للمصادر
-- sync_only = 1 يعني المنتجات تُزامَن فقط ولا تظهر للزبائن
-- sync_only = 0 (الافتراضي) يعني المنتجات تُزامَن وتُعرض للزبائن
ALTER TABLE sources ADD COLUMN IF NOT EXISTS sync_only TINYINT(1) NOT NULL DEFAULT 0;
