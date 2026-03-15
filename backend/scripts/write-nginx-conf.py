#!/usr/bin/env python3
"""Write Nginx config for a tenant site"""
import sys

# Template → Next.js port mapping
TEMPLATE_PORTS = {
    'digital-services-store': 4000,
    'game-topup-store':       4000,
    'gx-vault':               4001,
    'hardware-tools-store':   4002,
    'car-dealership-store':   4003,
    'smm-store':              4004,
    'stellar-store':          4005,
}

domain = sys.argv[1] if len(sys.argv) > 1 else "magicdesign3.com"
template_id = sys.argv[2] if len(sys.argv) > 2 else None
store_port = TEMPLATE_PORTS.get(template_id, 4000)
www_domain = f"www.{domain}"

conf = f"""# --- NEXIRO-FLUX Tenant: {domain} (template: {template_id or 'default'}, port: {store_port}) ---
server {{
    listen 80;
    server_name {domain} {www_domain};

    # API routes -> Express backend (port 3000)
    location /api/ {{
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
        client_max_body_size 50M;
    }}

    # Everything else -> Next.js store (port {store_port})
    location / {{
        proxy_pass http://127.0.0.1:{store_port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_intercept_errors on;
    }}

    # Maintenance page when Next.js is down (during rebuilds)
    error_page 502 503 504 /maintenance.html;
    location = /maintenance.html {{
        root /var/www/nexiro-flux/nginx;
        internal;
    }}
}}
"""

output_path = f"/etc/nginx/sites-available/{domain}"
with open(output_path, 'w') as f:
    f.write(conf)
print(f"Written to {output_path}")
