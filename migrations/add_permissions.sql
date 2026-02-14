-- إنشاء جدول الصلاحيات
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'اسم الصلاحية مثل products:read',
    description VARCHAR(255) NOT NULL COMMENT 'وصف الصلاحية بالعربي',
    category VARCHAR(50) NOT NULL COMMENT 'تصنيف الصلاحية مثل products',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول ربط المستخدمين بالصلاحيات
CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    site_key VARCHAR(255) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_permission (user_id, permission_id),
    INDEX idx_user_id (user_id),
    INDEX idx_permission_id (permission_id),
    INDEX idx_site_key (site_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج الصلاحيات الخاصة بالمنتجات
INSERT INTO permissions (name, description, category) VALUES
('products:read', 'عرض المنتجات', 'products'),
('products:create', 'إضافة منتج', 'products'),
('products:update', 'تعديل منتج', 'products'),
('products:delete', 'حذف منتج', 'products'),
('products:sync', 'المزامنة مع مصدر خارجي', 'products')
ON DUPLICATE KEY UPDATE description=VALUES(description);
