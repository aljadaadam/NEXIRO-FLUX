-- Check if those product IDs exist but in wrong site_key
SELECT o.id as order_id, o.site_key as order_site, o.product_id,
  p1.id as product_in_same_site, p1.site_key as p1_site,
  p2.id as product_any_site, p2.site_key as p2_site, p2.source_price as p2_source_price
FROM orders o
LEFT JOIN products p1 ON p1.id = o.product_id AND p1.site_key = o.site_key
LEFT JOIN products p2 ON p2.id = o.product_id
WHERE o.payment_status = 'paid' AND p1.id IS NULL
LIMIT 15;

-- Check if products were deleted (do we have deleted products?)
SELECT COUNT(*) as total_products FROM products;
SELECT MAX(id) as max_product_id FROM products;
SELECT MAX(product_id) as max_order_product_id FROM orders;

-- Check specific product ID that should exist
SELECT id, site_key, name, price, source_price FROM products WHERE id IN (2794, 1742, 2927, 6623, 6608, 8104, 8105);
