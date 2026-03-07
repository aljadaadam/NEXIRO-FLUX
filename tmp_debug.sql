SELECT id, level, source, message, request_url, created_at FROM error_log WHERE request_url LIKE '%banners%' ORDER BY id DESC LIMIT 10;
