-- إضافة حقل تحويل الاتصال لمنتج آخر
-- يتم تشغيله مرة واحدة على قاعدة البيانات الموجودة

ALTER TABLE products ADD COLUMN linked_product_id INT NULL COMMENT 'تحويل الاتصال لمنتج آخر' AFTER is_featured;
