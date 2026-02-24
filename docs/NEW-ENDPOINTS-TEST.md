# 🚀 اختبار Endpoints الجديدة

## ✅ تم إضافة الـ Endpoints التالية:

1. **POST /api/products/import** - استيراد منتجات بشكل جماعي
2. **POST /api/products/sync** - مزامنة مع API خارجي
3. **POST /api/products** - إنشاء منتج (تم إصلاحه)

---

## 🧪 اختبار 1: إنشاء منتج واحد

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "لابتوب Dell XPS 15",
    "description": "لابتوب للأعمال والتصميم",
    "price": 5999.99
  }'
```

**الاستجابة المتوقعة:**
```json
{
  "message": "تم إنشاء المنتج بنجاح",
  "product": {
    "id": 1,
    "site_key": "local-dev",
    "name": "لابتوب Dell XPS 15",
    "description": "لابتوب للأعمال والتصميم",
    "price": 5999.99,
    "created_at": "2025-12-11T..."
  }
}
```

---

## 🧪 اختبار 2: استيراد منتجات (Bulk Import)

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
        "description": "تابلت متوسط الحجم",
        "price": 2499.00
      },
      {
        "name": "Apple Watch Series 9",
        "description": "ساعة ذكية",
        "price": 1799.00
      },
      {
        "name": "AirPods Pro",
        "description": "سماعات لاسلكية",
        "price": 999.00
      }
    ]
  }'
```

**الاستجابة المتوقعة:**
```json
{
  "message": "تم استيراد 5 من 5 منتج بنجاح",
  "results": {
    "imported": 5,
    "failed": 0,
    "total": 5,
    "successProducts": [...],
    "failedProducts": []
  }
}
```

---

## 🧪 اختبار 3: استيراد مع أخطاء

```bash
curl -X POST http://localhost:3001/api/products/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "name": "Samsung Galaxy S24",
        "price": 3499.00
      },
      {
        "name": "منتج بدون سعر"
      },
      {
        "description": "منتج بدون اسم",
        "price": 100
      },
      {
        "name": "Xbox Series X",
        "price": -500
      }
    ]
  }'
```

**الاستجابة المتوقعة:**
```json
{
  "message": "تم استيراد 1 من 4 منتج بنجاح",
  "results": {
    "imported": 1,
    "failed": 3,
    "total": 4,
    "successProducts": [
      {
        "id": 6,
        "name": "Samsung Galaxy S24",
        "price": 3499
      }
    ],
    "failedProducts": [
      {
        "product": {"name": "منتج بدون سعر"},
        "error": "الاسم والسعر مطلوبان"
      },
      {
        "product": {"description": "منتج بدون اسم", "price": 100},
        "error": "الاسم والسعر مطلوبان"
      },
      {
        "product": {"name": "Xbox Series X", "price": -500},
        "error": "السعر يجب أن يكون رقم موجب"
      }
    ]
  }
}
```

---

## 🧪 اختبار 4: مزامنة مع API خارجي (Mock Example)

### إنشاء ملف Mock API (اختياري للاختبار)

أنشئ ملف `mock-api-products.json`:
```json
{
  "products": [
    {
      "name": "Sony PlayStation 5",
      "description": "جهاز ألعاب الجيل الخامس",
      "price": 2499.00
    },
    {
      "name": "Nintendo Switch OLED",
      "description": "جهاز ألعاب محمول",
      "price": 1499.00
    }
  ]
}
```

### استخدام API حقيقي (مثال):
```bash
curl -X POST http://localhost:3001/api/products/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://fakestoreapi.com/products",
    "apiKey": ""
  }'
```

**ملاحظة:** FakeStoreAPI مجاني ولا يحتاج API Key

**الاستجابة المتوقعة:**
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

## 🧪 اختبار 5: مزامنة مع API يحتاج Authentication

```bash
curl -X POST http://localhost:3001/api/products/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://api.example.com/products",
    "apiKey": "your-api-key-here"
  }'
```

---

## 🧪 اختبار 6: التحقق من الصلاحيات

### محاولة الاستيراد بدون صلاحية products:create
**النتيجة المتوقعة:**
```json
{
  "error": "ليس لديك صلاحية: products:create",
  "required_permission": "products:create"
}
```

### محاولة المزامنة بدون صلاحية products:sync
**النتيجة المتوقعة:**
```json
{
  "error": "ليس لديك صلاحية: products:sync",
  "required_permission": "products:sync"
}
```

---

## 📊 اختبار شامل: سيناريو كامل

### 1. تسجيل الدخول
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "aljadadm654@gmail.com", "password": "12345678"}'
```

### 2. استيراد 10 منتجات
```bash
curl -X POST http://localhost:3001/api/products/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"name": "Product 1", "price": 100},
      {"name": "Product 2", "price": 200},
      {"name": "Product 3", "price": 300},
      {"name": "Product 4", "price": 400},
      {"name": "Product 5", "price": 500},
      {"name": "Product 6", "price": 600},
      {"name": "Product 7", "price": 700},
      {"name": "Product 8", "price": 800},
      {"name": "Product 9", "price": 900},
      {"name": "Product 10", "price": 1000}
    ]
  }'
```

### 3. التحقق من المنتجات
```bash
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. مزامنة من FakeStoreAPI
```bash
curl -X POST http://localhost:3001/api/products/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sourceUrl": "https://fakestoreapi.com/products"}'
```

### 5. عد المنتجات النهائي
```bash
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.products | length'
```

---

## ✅ قائمة التحقق

- ✅ POST /api/products - إنشاء منتج واحد
- ✅ POST /api/products/import - استيراد منتجات
- ✅ POST /api/products/sync - مزامنة مع API خارجي
- ✅ التحقق من الصلاحيات لكل endpoint
- ✅ معالجة الأخطاء بشكل صحيح
- ✅ دعم تنسيقات API مختلفة

---

## 🎯 الميزات المضافة

1. **Bulk Import**: استيراد عدة منتجات دفعة واحدة
2. **External Sync**: المزامنة مع أي API خارجي
3. **Error Handling**: معالجة متقدمة للأخطاء
4. **Flexible Data Format**: دعم تنسيقات بيانات متعددة
5. **Permission Protected**: حماية كاملة بنظام الصلاحيات

---

**الآن Dashboard يعمل بالكامل! 🎉**
