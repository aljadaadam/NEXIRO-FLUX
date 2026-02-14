# 🔧 استكشاف وإصلاح مشاكل Dashboard

## ✅ تم الإصلاح! CORS Issue

### المشكلة الأساسية:
`net::ERR_FAILED` و `Failed to import products` كانت بسبب **CORS blocking**.

### ✅ الحل المطبق:
تم تحديث إعدادات CORS في `/var/www/nexiro-flux/src/app.js`:

```javascript
app.use(cors({
  origin: true, // السماح لجميع Origins (Development)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
```

### 🎯 النتيجة:
- ✅ CORS يعمل بشكل صحيح
- ✅ Dashboard يمكنه الآن الاتصال بـ Backend
- ✅ جميع Endpoints قابلة للوصول من Frontend

---

## ❌ المشكلة السابقة: Failed to import products / مشكلة في جلب المنتجات

### ✅ Backend يعمل بشكل صحيح
تم اختبار جميع Endpoints وهي تعمل بنجاح:
- ✅ GET /api/products
- ✅ POST /api/products
- ✅ POST /api/products/import
- ✅ POST /api/products/sync
- ✅ جميع endpoints المصادقة والصلاحيات

---

## 🔍 خطوات استكشاف الخطأ

### 1️⃣ التحقق من URL الخاص بالـ Backend

في Dashboard Frontend، تأكد من أن API URL صحيح:

**ملف: `.env` أو `vite.config.js` أو `config.js`**
```javascript
VITE_API_URL=http://localhost:3001
// أو
API_URL=http://localhost:3001
```

**تأكد أنه ليس:**
```javascript
❌ http://localhost:3001/  (slash زائد)
❌ http://127.0.0.1:3001
❌ http://localhost:3000  (بورت خاطئ)
```

---

### 2️⃣ التحقق من CORS في Console

افتح Developer Tools في المتصفح:
1. اضغط `F12`
2. انتقل إلى تبويب **Console**
3. ابحث عن أخطاء مثل:
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
❌ Failed to fetch
❌ Network Error
```

**الحل إذا وجدت خطأ CORS:**
```javascript
// في src/app.js (Backend)
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5178', // أو '*' للسماح للجميع
  credentials: true
}));
```

---

### 3️⃣ التحقق من Headers في Network Tab

في Developer Tools:
1. انتقل إلى تبويب **Network**
2. أعد تحميل الصفحة أو نفذ العملية
3. اضغط على طلب `/api/products`
4. تحقق من **Request Headers**:

**يجب أن تحتوي على:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**إذا لم تحتوي على `Authorization`:**
- تأكد من تخزين Token بعد تسجيل الدخول
- تأكد من إرسال Token مع كل طلب

---

### 4️⃣ التحقق من التوكن في LocalStorage

في Developer Tools Console:
```javascript
// تحقق من Token
console.log(localStorage.getItem('token'));
// أو
console.log(localStorage.getItem('auth_token'));
// أو
console.log(sessionStorage.getItem('token'));
```

**إذا كان `null` أو `undefined`:**
- سجل الدخول مرة أخرى
- تأكد من حفظ Token بعد Login

---

### 5️⃣ اختبار يدوي من Console

في Developer Tools Console، نفذ:

```javascript
// اختبار جلب المنتجات
fetch('http://localhost:3001/api/products', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(res => res.json())
.then(data => console.log('✅ Products:', data))
.catch(err => console.error('❌ Error:', err));
```

**إذا نجح الطلب:**
- المشكلة في كود Dashboard
- تحقق من كيفية إرسال الطلبات في الكود

**إذا فشل الطلب:**
- المشكلة في Token أو Backend
- تابع الخطوات التالية

---

### 6️⃣ تحقق من استجابة Login

عند تسجيل الدخول، يجب أن تحصل على:

```json
{
  "message": "تم تسجيل الدخول بنجاح",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "site_key": "local-dev",
  "user": {
    "id": 3,
    "email": "aljadadm654@gmail.com",
    "role": "admin"
  }
}
```

**تأكد من:**
- حفظ `token` في localStorage
- إرسال `Authorization: Bearer ${token}` مع كل طلب

---

### 7️⃣ كود مثالي لإرسال الطلبات

**تسجيل الدخول وحفظ Token:**
```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }
  
  throw new Error(data.error || 'فشل تسجيل الدخول');
}
```

**جلب المنتجات مع Token:**
```javascript
async function getProducts() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  
  const response = await fetch('http://localhost:3001/api/products', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.products;
}
```

**استيراد منتجات:**
```javascript
async function importProducts(products) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3001/api/products/import', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ products })
  });
  
  const data = await response.json();
  return data;
}
```

---

## 🧪 اختبار سريع من Terminal

```bash
# 1. تسجيل الدخول
TOKEN=$(curl -s http://localhost:3001/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"aljadadm654@gmail.com","password":"12345678"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. جلب المنتجات
curl -s http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN"

# 3. إنشاء منتج
curl -s http://localhost:3001/api/products \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":100}'
```

---

## 📋 قائمة التحقق

- [ ] Backend يعمل على `http://localhost:3001` ✅
- [ ] Dashboard يعمل على `http://localhost:5178` ✅
- [ ] API URL في Dashboard صحيح
- [ ] CORS مفعل في Backend
- [ ] Token يُحفظ في localStorage بعد Login
- [ ] Token يُرسل في header `Authorization`
- [ ] لا توجد أخطاء CORS في Console
- [ ] لا توجد أخطاء Network في Console
- [ ] الصلاحيات موجودة للأدمن

---

## 🆘 حلول سريعة

### الحل 1: إعادة تشغيل السيرفرات
```bash
# Backend
cd /var/www/nexiro-flux
pkill -f "node.*app.js"
npm start

# Frontend (في Terminal آخر)
cd /path/to/dashboard
npm run dev
```

### الحل 2: مسح Cache المتصفح
1. اضغط `Ctrl+Shift+Delete`
2. امسح Cookies و Cache
3. أعد تحميل الصفحة
4. سجل الدخول مرة أخرى

### الحل 3: استخدام Incognito/Private Mode
- افتح المتصفح في وضع Incognito
- جرب Dashboard هناك
- إذا عمل، المشكلة في Cache

### الحل 4: تحديث CORS في Backend
```javascript
// src/app.js
app.use(cors({
  origin: ['http://localhost:5178', 'http://127.0.0.1:5178'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📞 إذا استمرت المشكلة

أرسل لي:
1. **Screenshot** من Console (تبويب Console)
2. **Screenshot** من Network tab عند فشل الطلب
3. **الخطأ الكامل** من Console
4. **كود إرسال الطلب** من Dashboard

وسأساعدك في حلها! 🚀

---

**الخلاصة:**
- ✅ Backend يعمل بشكل مثالي (تم اختباره)
- ⚠️ المشكلة على الأرجح في Frontend:
  - URL خاطئ
  - Token غير محفوظ/مرسل بشكل صحيح
  - CORS issue
  - Headers ناقصة
