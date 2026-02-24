-- Add is_game column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_game TINYINT(1) DEFAULT 0;
