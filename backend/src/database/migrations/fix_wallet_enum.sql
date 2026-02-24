ALTER TABLE payment_gateways MODIFY COLUMN type ENUM('paypal','bank_transfer','usdt','binance','wallet') NOT NULL;
