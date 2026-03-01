-- Fix existing payment records with amount=0 for purchase code purchases
UPDATE payments SET amount = 14.90, description = CONCAT(description, ' — Original price restored') WHERE site_key LIKE 'wayl-fon%' AND amount = 0 AND payment_method = 'purchase_code';

-- Verify
SELECT id, site_key, amount, payment_method, status, description FROM payments WHERE site_key LIKE 'wayl-fon%';
