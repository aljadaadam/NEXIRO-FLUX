# 🚀 NEXIRO FLUX DASHBOARD - دليل الإدارة والمصادر

## 📋 نظرة عامة
لوحة تحكم متقدمة لإدارة المنتجات من مصادر خارجية متعددة مع نظام ربح تلقائي.

---

## 🎯 الميزات الرئيسية

### 1. إدارة المصادر الخارجية 🔌
- إضافة مصادر API متعددة (sd-unlocker وغيرها)
- تسمية مخصصة لكل مصدر
- حفظ بيانات الاتصال (URL, Username, API Key, Cookie)
- اختبار الاتصال قبل الحفظ
- تفعيل/تعطيل المصادر

### 2. نظام الأرباح التلقائي 💰
- ضبط نسبة الربح لكل مصدر (%)
- تطبيق نسبة الربح على جميع المنتجات دفعة واحدة
- حساب تلقائي للأسعار النهائية
- معاينة السعر قبل التطبيق

### 3. استيراد المنتجات 📥
- استيراد من API خارجي
- إضافة يدوية للمنتجات
- ربط تلقائي بالمصدر
- تصنيف حسب النوع (SERVER/IMEI/REMOTE)
- معالجة شاملة للأخطاء

### 4. إدارة المنتجات 📦
- عرض المنتجات بالمجموعات
- تعديل الأسعار والأوقات
- تفعيل/تعطيل المنتجات
- بحث وفلترة متقدم
- إحصائيات فورية

### 5. العمل بدون اتصال 🔄
- حفظ البيانات محلياً (localStorage)
- عرض البيانات المحفوظة عند فشل الاتصال
- تحذيرات واضحة للمستخدم
- إعادة محاولة الاتصال

---

## 🗂️ هيكل المشروع

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx          # القائمة الجانبية المحسنة
│   ├── Products/
│   │   └── ImportProductsModal.jsx  # نافذة الاستيراد المحسنة
│   └── common/
│       └── LoadingSpinner.jsx
├── pages/
│   ├── Dashboard/
│   ├── Products/
│   │   └── ProductsPage.jsx     # صفحة المنتجات + Loading & Caching
│   ├── Sources/
│   │   └── SourcesPage.jsx      # صفحة إدارة المصادر (جديد)
│   ├── Orders/
│   ├── Users/
│   ├── Analytics/
│   └── Settings/
├── services/
│   ├── api.js
│   ├── products.js
│   └── sources.js               # خدمات المصادر (جديد)
└── context/
    ├── LanguageContext.jsx
    └── AuthContext.jsx
```

---

## 🔌 إعداد المصادر الخارجية

### الخطوة 1: إضافة مصدر جديد

1. انتقل إلى: **المنتجات → إدارة المصادر**
2. اضغط **➕ إضافة مصدر جديد**
3. املأ البيانات:
   ```
   اسم المصدر: sd-unlocker
   رابط API: https://sd-unlocker.com/api/index.php
   اسم المستخدم: your_username
   مفتاح API: your_api_key
   Cookie: (اختياري)
   نسبة الربح الافتراضية: 15%
   ```
4. اضغط **🔍 اختبار الاتصال**
5. بعد النجاح، اضغط **💾 حفظ**

### الخطوة 2: استيراد المنتجات

1. انتقل إلى: **المنتجات**
2. اضغط **📥 استيراد منتجات**
3. اختر **استيراد من API**
4. أدخل بيانات المصدر أو اختره من القائمة
5. اضغط **استيراد المنتجات**
6. انتظر حتى تكتمل العملية ✅

### الخطوة 3: تطبيق نسبة الربح

1. في صفحة **إدارة المصادر**
2. اختر المصدر المطلوب
3. اضغط **💰 تطبيق نسبة الربح**
4. أدخل النسبة الجديدة (مثلاً: 20%)
5. شاهد المعاينة:
   ```
   سعر المصدر: $1.00
   نسبة الربح: 20%
   السعر النهائي: $1.20
   ```
6. اضغط **✅ تطبيق الربح**
7. سيتم تحديث جميع المنتجات المرتبطة تلقائياً

---

## 📡 API Backend المطلوب

### نقاط النهاية (Endpoints)

#### إدارة المصادر

```javascript
// إنشاء مصدر جديد
POST /api/sources
Body: {
  name: "sd-unlocker",
  api_url: "https://sd-unlocker.com/api/index.php",
  username: "user123",
  api_key: "xxx-xxx-xxx",
  cookie: "...",
  profit_percentage: 15.0,
  description: "مصدر SD-Unlocker الرئيسي"
}

// جلب جميع المصادر
GET /api/sources

// جلب مصدر محدد
GET /api/sources/:id

// تحديث مصدر
PUT /api/sources/:id

// حذف مصدر
DELETE /api/sources/:id

// تفعيل/تعطيل مصدر
PATCH /api/sources/:id/status
Body: { enabled: true/false }

// اختبار اتصال المصدر
POST /api/sources/:id/test
Response: { success: true, message: "Connection successful" }

// مزامنة منتجات المصدر
POST /api/sources/:id/sync
Response: { success: true, count: 245 }

// تطبيق نسبة الربح
POST /api/sources/:id/apply-profit
Body: { profitPercentage: 20.0 }
Response: { success: true, updatedCount: 245 }

// إحصائيات المصدر
GET /api/sources/:id/stats
Response: {
  productsCount: 245,
  activeProducts: 200,
  totalValue: 5000.00
}
```

#### إدارة المنتجات

```javascript
// استيراد منتجات
POST /api/products/import
Body: {
  products: [
    {
      sourceName: "sd-unlocker",
      sourceUrl: "https://...",
      groupName: "Dragon Frp Tool",
      groupType: "SERVER",
      serviceName: "Samsung FRP",
      credit: "0.930",
      time: "1-5 Minutes",
      customFields: [...],
      enabled: true
    }
  ]
}

// جلب جميع المنتجات
GET /api/products

// تحديث منتج
PUT /api/products/:id
Body: { credit: "1.500", time: "5-10 Minutes" }

// تفعيل/تعطيل منتج
PATCH /api/products/:id/status
Body: { enabled: true/false }

// مزامنة المنتجات
POST /api/products/sync

// إحصائيات المنتجات
GET /api/products/stats
```

---

## 💾 قاعدة البيانات

### جدول المصادر (sources)

```sql
CREATE TABLE sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  api_url VARCHAR(500) NOT NULL,
  username VARCHAR(100) NOT NULL,
  api_key VARCHAR(500) NOT NULL,  -- يجب تشفيره
  cookie TEXT,
  profit_percentage DECIMAL(5,2) DEFAULT 0.00,
  enabled BOOLEAN DEFAULT true,
  description TEXT,
  products_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_enabled (enabled)
);
```

### جدول المنتجات (products) - محدث

```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- معلومات المصدر
  source_id INT,
  source_name VARCHAR(100),
  source_url VARCHAR(500),
  
  -- معلومات المجموعة
  group_key VARCHAR(255),
  group_name VARCHAR(255),
  group_type ENUM('SERVER', 'IMEI', 'REMOTE'),
  
  -- معلومات الخدمة
  service_key VARCHAR(255),
  service_id BIGINT,
  service_name VARCHAR(500),
  service_type ENUM('SERVER', 'IMEI', 'REMOTE'),
  
  -- التسعير
  base_price DECIMAL(10,3),      -- السعر الأساسي من المصدر
  credit DECIMAL(10,3),          -- السعر النهائي بعد الربح
  profit_percentage DECIMAL(5,2), -- نسبة الربح المطبقة
  
  -- معلومات إضافية
  time VARCHAR(100),
  info TEXT,
  min_qnt VARCHAR(50),
  max_qnt VARCHAR(50),
  custom_fields JSON,
  
  -- الحالة
  enabled BOOLEAN DEFAULT true,
  
  -- التواريخ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL,
  INDEX idx_source (source_id),
  INDEX idx_group_type (group_type),
  INDEX idx_enabled (enabled)
);
```

---

## 🔐 الأمان

### 1. تشفير مفاتيح API

```javascript
// في Backend
const crypto = require('crypto');

// تشفير
const encryptApiKey = (apiKey) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.SECRET_KEY);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// فك التشفير
const decryptApiKey = (encryptedKey) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.SECRET_KEY);
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

### 2. التحقق من الصلاحيات

```javascript
// Middleware للتحقق من صلاحيات الأدمن
const checkAdminPermission = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// تطبيقه على Routes
router.post('/sources', checkAdminPermission, createSource);
router.put('/sources/:id', checkAdminPermission, updateSource);
router.delete('/sources/:id', checkAdminPermission, deleteSource);
```

---

## 🚀 تشغيل المشروع

### 1. التثبيت

```bash
# تثبيت المكتبات
npm install

# تشغيل في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview
```

### 2. المتغيرات البيئية

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3000/api

# Backend (.env)
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nexiro_flux
SECRET_KEY=your_secret_key_for_encryption
JWT_SECRET=your_jwt_secret
```

---

## 📊 مثال عملي: تدفق الطلب

### السيناريو: عميل يطلب خدمة FRP

```
1. العميل يختار منتج "Samsung FRP Unlock"
   السعر المعروض: $1.50 (بعد الربح)
   ↓
2. النظام يتحقق من بيانات المنتج:
   {
     sourceName: "sd-unlocker",
     serviceId: 181103,
     basePrice: 1.30,
     credit: 1.50,
     profitPercentage: 15.38
   }
   ↓
3. النظام يرسل طلب إلى sd-unlocker API:
   POST https://sd-unlocker.com/api/index.php
   {
     username: "your_username",
     apiaccesskey: "your_key",
     serviceid: 181103,
     imei: "123456789012345"
   }
   ↓
4. sd-unlocker يعالج الطلب ويخصم $1.30
   ↓
5. النظام يستلم النتيجة ويرسلها للعميل
   ↓
6. الربح المحقق: $1.50 - $1.30 = $0.20
```

---

## 🛠️ استكشاف الأخطاء

### المشكلة: فشل اتصال المصدر

**الحل**:
1. تحقق من بيانات الاتصال
2. اختبر الاتصال من صفحة المصادر
3. تحقق من الـ Cookie إذا كان مطلوباً
4. راجع سجل الأخطاء في Console

### المشكلة: المنتجات لا تظهر

**الحل**:
1. تحقق من وجود اتصال بالسيرفر
2. افحص localStorage للبيانات المحفوظة
3. جرب المزامنة من جديد
4. تحقق من Console للأخطاء

### المشكلة: نسبة الربح لا تطبق

**الحل**:
1. تحقق من أن المنتجات مرتبطة بالمصدر الصحيح
2. تأكد من وجود base_price في قاعدة البيانات
3. راجع Backend logs
4. جرب تطبيق نسبة الربح مرة أخرى

---

## 📞 الدعم

للحصول على المساعدة:
1. راجع ملف `IMPROVEMENTS-SUMMARY.md` للتفاصيل التقنية
2. راجع ملف `IMPORT-PRODUCTS-SYSTEM.md` لنظام الاستيراد
3. افحص Console للأخطاء
4. تحقق من Backend logs

---

## 📝 ملاحظات مهمة

⚠️ **تنبيه**: 
- مفاتيح API حساسة - يجب تشفيرها في قاعدة البيانات
- استخدم HTTPS في الإنتاج
- قم بعمل backup دوري لقاعدة البيانات
- راقب استخدام API الخارجي (Rate Limits)

✅ **نصائح**:
- اختبر الاتصال قبل حفظ المصدر
- حدث نسبة الربح بشكل دوري
- راقب الإحصائيات باستمرار
- احفظ نسخة احتياطية من البيانات المحلية

---

## 🎯 الخلاصة

نظام متكامل لإدارة المنتجات والمصادر الخارجية مع:
- ✅ واجهة سهلة الاستخدام
- ✅ نظام ربح تلقائي ذكي
- ✅ معالجة شاملة للأخطاء
- ✅ دعم العمل بدون اتصال
- ✅ تجربة مستخدم احترافية

**الحالة**: Frontend جاهز 100% ✅  
**المطلوب**: Backend APIs  
**التاريخ**: December 11, 2025  
**النسخة**: 2.0.0

---

**Happy Coding! 🚀**
