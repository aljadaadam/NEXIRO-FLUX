-- Orders with no product match or no source_price
SELECT o.site_key, o.id as order_id, o.product_id, o.unit_price, p.source_price, p.price as product_price,
  CASE WHEN p.id IS NULL THEN 'NO_PRODUCT_MATCH' WHEN p.source_price IS NULL THEN 'NO_SOURCE_PRICE' ELSE 'OK' END as issue
FROM orders o
LEFT JOIN products p ON p.id = o.product_id AND p.site_key = o.site_key
WHERE o.payment_status = 'paid' AND (p.source_price IS NULL OR p.id IS NULL)
LIMIT 30;

-- Count of issues per site
SELECT o.site_key,
  SUM(CASE WHEN p.id IS NULL THEN 1 ELSE 0 END) as no_product_match,
  SUM(CASE WHEN p.id IS NOT NULL AND p.source_price IS NULL THEN 1 ELSE 0 END) as no_source_price,
  SUM(CASE WHEN p.id IS NOT NULL AND p.source_price IS NOT NULL THEN 1 ELSE 0 END) as ok_orders
FROM orders o
LEFT JOIN products p ON p.id = o.product_id AND p.site_key = o.site_key
WHERE o.payment_status = 'paid'
GROUP BY o.site_key;
