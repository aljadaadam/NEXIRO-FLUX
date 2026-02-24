#!/bin/bash
SK='trade-zone-0c57d8-mlnjubxr'
DB='nexiro_flux_central'

echo "Deleting site: $SK"
mariadb "$DB" -e "DELETE FROM activity_log WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM customizations WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM subscriptions WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM notifications WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM payment_gateways WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM payments WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM products WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM sources WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM orders WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM customers WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM tickets WHERE site_key='$SK');"
mariadb "$DB" -e "DELETE FROM tickets WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM users WHERE site_key='$SK';"
mariadb "$DB" -e "DELETE FROM sites WHERE site_key='$SK';"

echo "Done. Remaining:"
mariadb "$DB" -e "SELECT id, site_key, domain FROM sites;"

# Remove nginx config
rm -f /etc/nginx/sites-enabled/magicdesign3.com
rm -f /etc/nginx/sites-available/magicdesign3.com
nginx -t && systemctl reload nginx
echo "Nginx cleaned."
