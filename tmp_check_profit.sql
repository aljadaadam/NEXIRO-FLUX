-- 1. Orders per site with paid count
SELECT site_key, COUNT(*) as total_orders, SUM(payment_status='paid') as paid_orders FROM orders GROUP BY site_key;

-- 2. Check source_price in products
SELECT site_key, COUNT(*) as total_products, SUM(source_price IS NOT NULL AND source_price > 0) as has_source_price, SUM(source_price IS NULL OR source_price = 0) as no_source_price FROM products GROUP BY site_key;

-- 3. Profit calculation test for each site
SELECT o.site_key,
  COALESCE(SUM(GREATEST(((o.unit_price - COALESCE(p.source_price, o.unit_price)) * COALESCE(o.quantity, 1)), 0)), 0) as total_profit,
  COALESCE(SUM(o.total_price), 0) as total_revenue
FROM orders o
LEFT JOIN products p ON p.id = o.product_id AND p.site_key = o.site_key
WHERE o.payment_status = 'paid'
GROUP BY o.site_key;

-- 4. Sample orders with their product source_price
SELECT o.site_key, o.id, o.unit_price, o.total_price, o.payment_status, p.source_price, p.price as product_price
FROM orders o
LEFT JOIN products p ON p.id = o.product_id AND p.site_key = o.site_key
WHERE o.payment_status = 'paid'
LIMIT 20;
