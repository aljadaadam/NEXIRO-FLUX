-- إضافة نوع بوابة بنكك إلى جدول بوابات الدفع
ALTER TABLE payment_gateways MODIFY COLUMN type ENUM('paypal','bank_transfer','usdt','binance','wallet','bankak') NOT NULL;
