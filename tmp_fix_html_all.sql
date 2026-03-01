-- Clean HTML from ALL orders across all sites
UPDATE orders SET server_response = TRIM(REGEXP_REPLACE(server_response, '<[^>]*>', '')) WHERE server_response LIKE '%<%>%';
SELECT ROW_COUNT() as cleaned_orders;
