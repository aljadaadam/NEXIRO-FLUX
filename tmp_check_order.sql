-- Reset order 10387 for retry
UPDATE orders SET external_reference_id = NULL, source_id = NULL, server_response = NULL, status = 'pending' WHERE site_key = 'nyala-gsm-4865d3-mm2jr396' AND order_number = '10387';
SELECT id, order_number, status, product_id, notes, external_reference_id, source_id FROM orders WHERE site_key = 'nyala-gsm-4865d3-mm2jr396' AND order_number = '10387'\G
