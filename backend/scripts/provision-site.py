#!/usr/bin/env python3
"""
NEXIRO-FLUX — Auto Site Provisioner
Creates Nginx config + SSL certificate for a new tenant domain.

Usage:
  python3 /var/www/nexiro-flux/backend/scripts/provision-site.py <domain>
  python3 /var/www/nexiro-flux/backend/scripts/provision-site.py magicdesign3.com

What it does:
  1. Creates /etc/nginx/sites-available/<domain>
  2. Symlinks to /etc/nginx/sites-enabled/<domain>
  3. Reloads Nginx
  4. Issues SSL certificate via certbot
  5. Outputs JSON result

Exit codes:
  0 = success
  1 = error
"""

import sys
import os
import subprocess
import json
import re

STORE_PORT = 4000    # Next.js store port
BACKEND_PORT = 3000  # Express API port
CERTBOT_EMAIL = "admin@nexiroflux.com"

def validate_domain(domain):
    """Basic domain validation"""
    pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, domain)) and len(domain) <= 253

def write_nginx_conf(domain):
    """Write Nginx config for a tenant"""
    www = f"www.{domain}"
    conf = f"""# --- NEXIRO-FLUX Tenant: {domain} ---
server {{
    listen 80;
    server_name {domain} {www};

    # API routes -> Express backend (port {BACKEND_PORT})
    location /api/ {{
        proxy_pass http://127.0.0.1:{BACKEND_PORT}/api/;
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

    # Everything else -> Next.js store (port {STORE_PORT})
    location / {{
        proxy_pass http://127.0.0.1:{STORE_PORT};
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
    path = f"/etc/nginx/sites-available/{domain}"
    with open(path, 'w') as f:
        f.write(conf)
    return path

def enable_site(domain):
    """Create symlink in sites-enabled"""
    available = f"/etc/nginx/sites-available/{domain}"
    enabled = f"/etc/nginx/sites-enabled/{domain}"
    if os.path.exists(enabled):
        os.remove(enabled)
    os.symlink(available, enabled)

def test_nginx():
    """Test Nginx config syntax"""
    result = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
    return result.returncode == 0, result.stderr

def reload_nginx():
    """Reload Nginx"""
    result = subprocess.run(['systemctl', 'reload', 'nginx'], capture_output=True, text=True)
    return result.returncode == 0

def issue_ssl(domain):
    """Issue SSL via certbot"""
    www = f"www.{domain}"
    result = subprocess.run([
        'certbot', '--nginx',
        '-d', domain,
        '-d', www,
        '--non-interactive',
        '--agree-tos',
        '--email', CERTBOT_EMAIL,
        '--redirect'
    ], capture_output=True, text=True, timeout=120)
    return result.returncode == 0, result.stdout + result.stderr

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: provision-site.py <domain>"}))
        sys.exit(1)
    
    domain = sys.argv[1].lower().strip()
    
    if not validate_domain(domain):
        print(json.dumps({"success": False, "error": f"Invalid domain: {domain}"}))
        sys.exit(1)
    
    steps = []
    
    try:
        # Step 1: Write Nginx config
        conf_path = write_nginx_conf(domain)
        steps.append(f"Nginx config written: {conf_path}")
        
        # Step 2: Enable site
        enable_site(domain)
        steps.append("Site enabled (symlink created)")
        
        # Step 3: Test Nginx
        ok, err = test_nginx()
        if not ok:
            print(json.dumps({"success": False, "error": f"Nginx test failed: {err}", "steps": steps}))
            sys.exit(1)
        steps.append("Nginx config test passed")
        
        # Step 4: Reload Nginx
        if not reload_nginx():
            print(json.dumps({"success": False, "error": "Nginx reload failed", "steps": steps}))
            sys.exit(1)
        steps.append("Nginx reloaded")
        
        # Step 5: Issue SSL
        ssl_ok, ssl_output = issue_ssl(domain)
        if ssl_ok:
            steps.append("SSL certificate issued successfully")
        else:
            # SSL failure is non-blocking — site works on HTTP
            steps.append(f"SSL warning: certbot returned non-zero. Site accessible via HTTP. Output: {ssl_output[:200]}")
        
        print(json.dumps({
            "success": True,
            "domain": domain,
            "ssl": ssl_ok,
            "steps": steps
        }))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e), "steps": steps}))
        sys.exit(1)

if __name__ == '__main__':
    main()
