#!/bin/bash

# اختبار شامل لجميع Endpoints

echo "🧪 اختبار شامل لـ Nexiro-Flux API"
echo "===================================="
echo ""

BASE_URL="http://localhost:3001"

# اختبار 1: تسجيل الدخول
echo "1️⃣ اختبار تسجيل الدخول..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"aljadadm654@gmail.com","password":"12345678"}')

echo "$LOGIN_RESPONSE" | grep -q "token"
if [ $? -eq 0 ]; then
    echo "   ✅ تسجيل الدخول نجح"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:50}..."
else
    echo "   ❌ فشل تسجيل الدخول"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# اختبار 2: جلب المنتجات
echo "2️⃣ اختبار جلب المنتجات..."
PRODUCTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/products" \
  -H "Authorization: Bearer $TOKEN")

echo "$PRODUCTS_RESPONSE" | grep -q "products"
if [ $? -eq 0 ]; then
    echo "   ✅ جلب المنتجات نجح"
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id"' | wc -l)
    echo "   عدد المنتجات: $PRODUCT_COUNT"
else
    echo "   ❌ فشل جلب المنتجات"
    echo "   Response: $PRODUCTS_RESPONSE"
fi
echo ""

# اختبار 3: إنشاء منتج
echo "3️⃣ اختبار إنشاء منتج..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test Description","price":99.99}')

echo "$CREATE_RESPONSE" | grep -q "تم إنشاء المنتج بنجاح"
if [ $? -eq 0 ]; then
    echo "   ✅ إنشاء منتج نجح"
else
    echo "   ❌ فشل إنشاء منتج"
    echo "   Response: $CREATE_RESPONSE"
fi
echo ""

# اختبار 4: استيراد منتجات
echo "4️⃣ اختبار استيراد منتجات..."
IMPORT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/products/import" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"products":[{"name":"Bulk Product 1","price":100},{"name":"Bulk Product 2","price":200}]}')

echo "$IMPORT_RESPONSE" | grep -q "تم استيراد"
if [ $? -eq 0 ]; then
    echo "   ✅ استيراد منتجات نجح"
    echo "   Response: ${IMPORT_RESPONSE:0:150}..."
else
    echo "   ❌ فشل استيراد منتجات"
    echo "   Response: $IMPORT_RESPONSE"
fi
echo ""

# اختبار 5: مزامنة مع API خارجي
echo "5️⃣ اختبار المزامنة مع API خارجي..."
SYNC_RESPONSE=$(curl -s -X POST "$BASE_URL/api/products/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sourceUrl":"https://fakestoreapi.com/products?limit=2"}')

echo "$SYNC_RESPONSE" | grep -q "تمت مزامنة"
if [ $? -eq 0 ]; then
    echo "   ✅ المزامنة نجحت"
    echo "   Response: ${SYNC_RESPONSE:0:150}..."
else
    echo "   ❌ فشلت المزامنة"
    echo "   Response: $SYNC_RESPONSE"
fi
echo ""

# اختبار 6: جلب الصلاحيات
echo "6️⃣ اختبار جلب الصلاحيات..."
PERMS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/permissions" \
  -H "Authorization: Bearer $TOKEN")

echo "$PERMS_RESPONSE" | grep -q "permissions"
if [ $? -eq 0 ]; then
    echo "   ✅ جلب الصلاحيات نجح"
    PERM_COUNT=$(echo "$PERMS_RESPONSE" | grep -o '"name":"products:' | wc -l)
    echo "   عدد صلاحيات المنتجات: $PERM_COUNT"
else
    echo "   ❌ فشل جلب الصلاحيات"
    echo "   Response: $PERMS_RESPONSE"
fi
echo ""

# اختبار 7: جلب صلاحيات الأدمن
echo "7️⃣ اختبار جلب صلاحيات الأدمن..."
USER_PERMS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/users/3/permissions" \
  -H "Authorization: Bearer $TOKEN")

echo "$USER_PERMS_RESPONSE" | grep -q "permissions"
if [ $? -eq 0 ]; then
    echo "   ✅ جلب صلاحيات الأدمن نجح"
    USER_PERM_COUNT=$(echo "$USER_PERMS_RESPONSE" | grep -o '"name":"products:' | wc -l)
    echo "   عدد صلاحيات الأدمن: $USER_PERM_COUNT"
else
    echo "   ❌ فشل جلب صلاحيات الأدمن"
    echo "   Response: $USER_PERMS_RESPONSE"
fi
echo ""

# ملخص نهائي
echo "===================================="
echo "✅ اكتمل الاختبار الشامل"
echo "===================================="
