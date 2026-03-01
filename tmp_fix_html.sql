-- Check and clean HTML from server_response
SELECT id, order_number, LEFT(server_response, 200) as resp_preview FROM orders WHERE site_key = 'nyala-gsm-4865d3-mm2jr396' AND order_number = '10387';

-- Clean HTML from server_response for this specific order
UPDATE orders SET server_response = REGEXP_REPLACE(server_response, '<[^>]*>', '') WHERE site_key = 'nyala-gsm-4865d3-mm2jr396' AND order_number = '10387' AND server_response LIKE '%<%';

-- Verify
SELECT id, order_number, server_response FROM orders WHERE site_key = 'nyala-gsm-4865d3-mm2jr396' AND order_number = '10387';
