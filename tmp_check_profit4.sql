-- Check if product 2794 ever existed
SELECT id, site_key, name FROM products WHERE id IN (2794, 1742, 2927, 6623, 6608, 8104, 8105);

-- Check if products got re-synced with new IDs (bulk delete + re-insert)
-- Let's look at current product IDs for one of the affected sites
SELECT MIN(id), MAX(id), COUNT(*) FROM products WHERE site_key = 'nyala-gsm-4865d3-mm2jr396';
SELECT MIN(id), MAX(id), COUNT(*) FROM products WHERE site_key = 'mt-servers-6c1b59-mm7ybm9y';

-- Check if there are any gaps (deleted products)
SELECT 'nyala' as site, COUNT(*) as products_exist FROM products WHERE site_key = 'nyala-gsm-4865d3-mm2jr396' AND id < 10000;
SELECT 'mt' as site, COUNT(*) as products_exist FROM products WHERE site_key = 'mt-servers-6c1b59-mm7ybm9y' AND id < 11000;

-- Check the sync/delete pattern: look at source_sync_logs or product creation dates
SELECT site_key, MIN(created_at), MAX(created_at) FROM products WHERE site_key IN ('nyala-gsm-4865d3-mm2jr396','mt-servers-6c1b59-mm7ybm9y','none-st-a306ee-mlqlv4ye') GROUP BY site_key;
