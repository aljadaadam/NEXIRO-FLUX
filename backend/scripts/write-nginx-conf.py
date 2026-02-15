#!/usr/bin/env python3
"""Write Nginx config for a tenant site"""
import sys

domain = sys.argv[1] if len(sys.argv) > 1 else "magicdesign3.com"
www_domain = f"www.{domain}"

conf = f"""# --- NEXIRO-FLUX Tenant: {domain} ---
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
        client_max_body_size 50M;
    }}

    # Everything else -> Next.js store (port 4000)
    location / {{
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }}
}}
"""

output_path = f"/etc/nginx/sites-available/{domain}"
with open(output_path, 'w') as f:
    f.write(conf)
print(f"Written to {output_path}")
