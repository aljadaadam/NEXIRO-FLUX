-- ─── جدول الفروع ───
CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  site_key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  address_en TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  lat DECIMAL(10, 7) DEFAULT NULL,
  lng DECIMAL(10, 7) DEFAULT NULL,
  working_hours VARCHAR(255) DEFAULT NULL,
  is_main TINYINT(1) DEFAULT 0,
  image VARCHAR(500) DEFAULT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_branches_site_key (site_key),
  INDEX idx_branches_city (city),
  INDEX idx_branches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
