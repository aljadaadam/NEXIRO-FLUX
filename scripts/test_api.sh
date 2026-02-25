#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Site-Key: nexiroflux" \
  -d '{"email":"admin@nexiroflux.com","password":"NexiroAdmin@2024"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")
echo "TOKEN_LEN=${#TOKEN}"
curl -s http://localhost:3000/api/dashboard/platform-stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Site-Key: nexiroflux" | python3 -m json.tool
