#!/bin/bash
# Delete all records for a site by site_key
SK="trade-zine-ead4a4-mlnitr3v"
DB="nexiro_flux_central"

echo "Deleting site: $SK"

mysql -u root "$DB" -e "DELETE FROM activity_log WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM customizations WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM subscriptions WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM notifications WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM payments WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM products WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM sources WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM orders WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM customers WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM tickets WHERE site_key='$SK');"
mysql -u root "$DB" -e "DELETE FROM tickets WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM users WHERE site_key='$SK';"
mysql -u root "$DB" -e "DELETE FROM sites WHERE site_key='$SK';"

echo "Done! Verifying..."
mysql -u root "$DB" -N -e "SELECT COUNT(*) FROM sites WHERE site_key='$SK';"
