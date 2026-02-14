# 🧪 اختبار نظام الصلاحيات عبر API - الدليل الشامل

## 📋 المتطلبات
- السيرفر يعمل على: `http://localhost:3001`
- Dashboard يعمل على: `http://localhost:5178`
- الأدمن: `aljadadm654@gmail.com` / `12345678`

---

## 🎯 Endpoints المتاحة

### المنتجات (Products)
- ✅ `GET /api/products` - جلب جميع المنتجات
- ✅ `POST /api/products` - إنشاء منتج واحد
- ✅ `POST /api/products/import` - استيراد منتجات (Bulk)
- ✅ `POST /api/products/sync` - مزامنة مع API خارجي
- ✅ `PUT /api/products/:id` - تحديث منتج
- ✅ `DELETE /api/products/:id` - حذف منتج

### المصادقة والصلاحيات (Auth & Permissions)
- ✅ `POST /api/auth/login` - تسجيل الدخول
- ✅ `POST /api/auth/register-admin` - تسجيل أدمن جديد
- ✅ `GET /api/auth/profile` - الملف الشخصي
- ✅ `GET /api/auth/permissions` - جميع الصلاحيات
- ✅ `GET /api/auth/users/:id/permissions` - صلاحيات مستخدم
- ✅ `POST /api/auth/permissions/grant` - منح صلاحية
- ✅ `POST /api/auth/permissions/revoke` - إلغاء صلاحية

---

## 🆕 Endpoints الجديدة

### 📦 استيراد منتجات (Bulk Import)

```bash
curl -X POST http://localhost:3001/api/products/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "name": "iPhone 15 Pro",
        "description": "أحدث هاتف من Apple",
        "price": 4999.00
      },
      {
        "name": "MacBook Pro M3",
        "description": "لابتوب احترافي",
        "price": 8999.00
      },
      {
        "name": "iPad Air",
        "price": 2499.00
      }
    ]
  }'
```

**الاستجابة:**
```json
{
  "message": "تم استيراد 3 من 3 منتج بنجاح",
  "results": {
    "imported": 3,
    "failed": 0,
    "total": 3,
    "successProducts": [...],
    "failedProducts": []
  }
}
```

### 🔄 مزامنة مع API خارجي

```bash
curl -X POST http://localhost:3001/api/products/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://fakestoreapi.com/products"
  }'
```

**الاستجابة:**
```json
{
  "message": "تمت مزامنة 20 من 20 منتج بنجاح",
  "results": {
    "synced": 20,
    "failed": 0,
    "total": 20,
    "syncedProducts": [...],
    "failedProducts": []
  }
}
```

---

## 1️⃣ تسجيل الدخول

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aljadadm654@gmail.com",
    "password": "12345678"
  }'
```

**احفظ الـ token من الاستجابة:**
```json
{
  "message": "تم تسجيل الدخول بنجاح",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "site_key": "local-dev",
  "user": {
    "id": 3,
    "name": "Aljad Admin",
    "email": "aljadadm654@gmail.com",
    "role": "admin",
    "site_key": "local-dev"
  }
}
```

---

## 2️⃣ جلب جميع الصلاحيات المتاحة

```bash
curl -X GET http://localhost:3001/api/auth/permissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**الاستجابة المتوقعة:**
```json
{
  "permissions": [
    {
      "id": 1,
      "name": "products:read",
      "description": "عرض المنتجات",
      "category": "products"
    },
    {
      "id": 2,
      "name": "products:create",
      "description": "إضافة منتج",
      "category": "products"
    },
    // ...
  ],
  "grouped": {
    "products": [...]
  }
}
```

---

## 3️⃣ جلب صلاحيات الأدمن الحالي

```bash
curl -X GET http://localhost:3001/api/auth/users/3/permissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**الاستجابة المتوقعة:**
```json
{
  "user_id": "3",
  "permissions": [
    {
      "id": 1,
      "name": "products:read",
      "description": "عرض المنتجات",
      "category": "products"
    },
    {
      "id": 2,
      "name": "products:create",
      "description": "إضافة منتج",
      "category": "products"
    },
    // ... جميع صلاحيات المنتجات
  ]
}
```

---

## 4️⃣ جلب جميع المنتجات (يتطلب products:read)

```bash
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**الاستجابة الناجحة:**
```json
{
  "products": []
}
```

**إذا لم تكن لديك الصلاحية:**
```json
{
  "error": "ليس لديك صلاحية: products:read",
  "required_permission": "products:read"
}
```

---

## 5️⃣ إضافة منتج (يتطلب products:create)

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "منتج تجريبي",
    "description": "وصف المنتج",
    "price": 99.99
  }'
```

**الاستجابة الناجحة:**
```json
{
  "message": "تم إنشاء المنتج بنجاح",
  "product": {
    "id": 1,
    "site_key": "local-dev",
    "name": "منتج تجريبي",
    "description": "وصف المنتج",
    "price": 99.99,
    "created_at": "2025-12-11T..."
  }
}
```

**إذا لم تكن لديك الصلاحية:**
```json
{
  "error": "ليس لديك صلاحية: products:create",
  "required_permission": "products:create"
}
```

---

## 6️⃣ إنشاء مستخدم جديد

```bash
curl -X POST http://localhost:3001/api/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "مستخدم جديد",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user"
  }'
```

**احفظ ID المستخدم الجديد من الاستجابة**

---

## 7️⃣ منح صلاحية للمستخدم الجديد

```bash
curl -X POST http://localhost:3001/api/auth/permissions/grant \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 4,
    "permission": "products:read"
  }'
```

**الاستجابة:**
```json
{
  "message": "تم منح الصلاحية بنجاح",
  "result": {
    "message": "تم منح الصلاحية بنجاح",
    "insertId": 6
  }
}
```

---

## 8️⃣ التحقق من صلاحيات المستخدم الجديد

```bash
curl -X GET http://localhost:3001/api/auth/users/4/permissions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 9️⃣ إلغاء صلاحية من المستخدم

```bash
curl -X POST http://localhost:3001/api/auth/permissions/revoke \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 4,
    "permission": "products:read"
  }'
```

**الاستجابة:**
```json
{
  "message": "تم إلغاء الصلاحية بنجاح"
}
```

---

## 🔍 سيناريو اختبار كامل

### السيناريو: منع مستخدم من إنشاء منتجات

1. **إنشاء مستخدم جديد** (الخطوة 6)
2. **منح صلاحية قراءة فقط** (الخطوة 7 مع `products:read`)
3. **تسجيل دخول المستخدم الجديد** (الخطوة 1 ببيانات المستخدم الجديد)
4. **محاولة قراءة المنتجات** ✅ ستنجح (الخطوة 4)
5. **محاولة إنشاء منتج** ❌ سترفض (الخطوة 5)

**النتيجة المتوقعة:**
```json
{
  "error": "ليس لديك صلاحية: products:create",
  "required_permission": "products:create"
}
```

---

## 📝 ملاحظات

- استبدل `YOUR_TOKEN_HERE` بالـ token الفعلي من الخطوة 1
- جميع الطلبات تتطلب header: `Authorization: Bearer <token>`
- الأدمن لديه جميع صلاحيات المنتجات افتراضياً
- المستخدمين العاديين يحتاجون منح صلاحيات يدوياً

---

## 🎯 اختبارات إضافية

### اختبار تحديث منتج (products:update)
```bash
curl -X PUT http://localhost:3001/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "منتج محدث",
    "description": "وصف جديد",
    "price": 149.99
  }'
```

### اختبار حذف منتج (products:delete)
```bash
curl -X DELETE http://localhost:3001/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**تم بحمد الله! ✨**
