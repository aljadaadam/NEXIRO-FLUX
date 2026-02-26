#!/bin/bash
# ─── Security Integration Test: Platform Admin vs Tenant Admin ───

echo "============================================"
echo "  SECURITY TEST: Platform Admin Access"
echo "============================================"

# 1. Login as platform admin
echo ""
echo "[1] Logging in as platform admin (admin@nexiroflux.com)..."
PLATFORM_RESP=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Site-Key: nexiroflux" \
  -d '{"email":"admin@nexiroflux.com","password":"Admin@2026!"}')

PLATFORM_TOKEN=$(echo "$PLATFORM_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
PLATFORM_ROLE=$(echo "$PLATFORM_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('role','?'))" 2>/dev/null)
PLATFORM_SITEKEY=$(echo "$PLATFORM_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('site',{}).get('site_key','?'))" 2>/dev/null)

if [ -z "$PLATFORM_TOKEN" ]; then
  echo "  FAIL: Could not get platform admin token"
  echo "  Response: $PLATFORM_RESP"
  exit 1
fi
echo "  Role: $PLATFORM_ROLE"
echo "  Site Key: $PLATFORM_SITEKEY"
echo "  Token: ${PLATFORM_TOKEN:0:30}..."

# 2. Test platform admin can access platform-stats
echo ""
echo "[2] Platform admin -> GET /api/dashboard/platform-stats..."
STATS_RESP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboard/platform-stats \
  -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "X-Site-Key: nexiroflux")
if [ "$STATS_RESP" = "200" ]; then
  echo "  PASS (HTTP $STATS_RESP) - Platform admin can access platform-stats"
else
  echo "  FAIL (HTTP $STATS_RESP) - Platform admin BLOCKED from platform-stats!"
fi

# 3. Test platform admin can access platform-users
echo ""
echo "[3] Platform admin -> GET /api/dashboard/platform-users..."
USERS_RESP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboard/platform-users \
  -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "X-Site-Key: nexiroflux")
if [ "$USERS_RESP" = "200" ]; then
  echo "  PASS (HTTP $USERS_RESP) - Platform admin can access platform-users"
else
  echo "  FAIL (HTTP $USERS_RESP) - Platform admin BLOCKED from platform-users!"
fi

# 4. Test platform admin can access purchase codes
echo ""
echo "[4] Platform admin -> GET /api/purchase-codes..."
CODES_RESP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/purchase-codes \
  -H "Authorization: Bearer $PLATFORM_TOKEN" \
  -H "X-Site-Key: nexiroflux")
if [ "$CODES_RESP" = "200" ]; then
  echo "  PASS (HTTP $CODES_RESP) - Platform admin can access purchase codes"
else
  echo "  FAIL (HTTP $CODES_RESP) - Platform admin BLOCKED from purchase codes!"
fi

echo ""
echo "============================================"
echo "  SECURITY TEST: Tenant Admin Blocked"
echo "============================================"

# 5. Find a tenant site_key
TENANT_SITEKEY=$(mysql -u root nexiro_flux_central -N -e "SELECT site_key FROM sites WHERE site_key != 'nexiroflux' LIMIT 1" 2>/dev/null)
if [ -z "$TENANT_SITEKEY" ]; then
  echo "  SKIP: No tenant sites found in DB"
  exit 0
fi
echo ""
echo "[5] Found tenant site_key: $TENANT_SITEKEY"

# 6. Get tenant admin user id
TENANT_ADMIN_ID=$(mysql -u root nexiro_flux_central -N -e "SELECT id FROM users WHERE site_key='$TENANT_SITEKEY' AND role='admin' LIMIT 1" 2>/dev/null)
if [ -z "$TENANT_ADMIN_ID" ]; then
  echo "  SKIP: No admin user found for tenant $TENANT_SITEKEY"
  exit 0
fi
echo "  Tenant admin user_id: $TENANT_ADMIN_ID"

# 7. Generate a real tenant admin JWT using the server's own token utility
echo ""
echo "[6] Generating tenant admin JWT via Node.js..."
TENANT_TOKEN=$(cd /var/www/nexiro-flux/backend && node -e "
const { generateToken } = require('./src/utils/token');
const token = generateToken($TENANT_ADMIN_ID, 'admin', '$TENANT_SITEKEY');
process.stdout.write(token);
" 2>/dev/null)

if [ -z "$TENANT_TOKEN" ]; then
  echo "  FAIL: Could not generate tenant admin token"
  exit 1
fi
echo "  Token: ${TENANT_TOKEN:0:30}..."

# 8. Test tenant admin CANNOT access platform-stats
echo ""
echo "[7] Tenant admin -> GET /api/dashboard/platform-stats..."
T_STATS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboard/platform-stats \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Site-Key: $TENANT_SITEKEY")
if [ "$T_STATS" = "403" ]; then
  echo "  PASS (HTTP $T_STATS) - Tenant admin BLOCKED from platform-stats"
elif [ "$T_STATS" = "200" ]; then
  echo "  FAIL (HTTP $T_STATS) - Tenant admin can access platform-stats!"
else
  echo "  INFO (HTTP $T_STATS) - Unexpected response"
fi

# 9. Test tenant admin CANNOT access platform-users
echo ""
echo "[8] Tenant admin -> GET /api/dashboard/platform-users..."
T_USERS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboard/platform-users \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Site-Key: $TENANT_SITEKEY")
if [ "$T_USERS" = "403" ]; then
  echo "  PASS (HTTP $T_USERS) - Tenant admin BLOCKED from platform-users"
elif [ "$T_USERS" = "200" ]; then
  echo "  FAIL (HTTP $T_USERS) - Tenant admin can access platform-users!"
else
  echo "  INFO (HTTP $T_USERS) - Unexpected response"
fi

# 10. Test tenant admin CANNOT access purchase codes
echo ""
echo "[9] Tenant admin -> GET /api/purchase-codes..."
T_CODES=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/purchase-codes \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "X-Site-Key: $TENANT_SITEKEY")
if [ "$T_CODES" = "403" ]; then
  echo "  PASS (HTTP $T_CODES) - Tenant admin BLOCKED from purchase codes"
elif [ "$T_CODES" = "200" ]; then
  echo "  FAIL (HTTP $T_CODES) - Tenant admin can access purchase codes!"
else
  echo "  INFO (HTTP $T_CODES) - Unexpected response"
fi

# 11. Test X-Site-Key spoofing: tenant admin tries sending X-Site-Key: nexiroflux
if [ -n "$TENANT_TOKEN" ]; then
  echo ""
  echo "============================================"
  echo "  SECURITY TEST: X-Site-Key Spoofing"
  echo "============================================"
  echo ""
  echo "[10] Tenant token + X-Site-Key: nexiroflux (spoofing attack)..."
  SPOOF_RESP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboard/platform-stats \
    -H "Authorization: Bearer $TENANT_TOKEN" \
    -H "X-Site-Key: nexiroflux")
  if [ "$SPOOF_RESP" = "403" ]; then
    echo "  PASS (HTTP $SPOOF_RESP) - Spoofing attack BLOCKED (token site_key mismatch)"
  elif [ "$SPOOF_RESP" = "200" ]; then
    echo "  FAIL (HTTP $SPOOF_RESP) - Spoofing attack NOT blocked!"
  else
    echo "  INFO (HTTP $SPOOF_RESP) - Unexpected response"
  fi
fi

echo ""
echo "============================================"
echo "  ALL TESTS COMPLETE"
echo "============================================"
