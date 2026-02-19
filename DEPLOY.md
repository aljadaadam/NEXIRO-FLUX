# NEXIRO-FLUX — دليل النشر والتشغيل الكامل

> مرجع ثابت لبناء وتشغيل وتحديث جميع أجزاء المشروع

---

## 📁 هيكل المشروع

```
NEXIRO-FLUX/
├── backend/          ← Express API (Node.js) — المنفذ 3000
├── website/          ← الموقع الرئيسي (React/Vite) — المنفذ 5174
│   └── public/templates/
│       └── ycz-store/ ← قالب المتجر (Next.js) — المنفذ 4000
└── DEPLOY.md         ← هذا الملف
```

---

## 🔧 المتطلبات

| البرنامج | الإصدار المطلوب |
|----------|----------------|
| Node.js  | 18+            |
| npm      | 9+             |
| MySQL    | 8+             |
| PM2      | (للإنتاج)      |
| Nginx    | (للإنتاج)      |

---

## 1️⃣ Backend — Express API

### التثبيت
```bash
cd backend
npm install
```

### متغيرات البيئة (.env)
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=كلمة_المرور
DB_NAME=nexiro_flux_central
DB_PORT=3306
JWT_SECRET=مفتاح-سري-قوي
JWT_EXPIRES_IN=7d
SITE_KEY=your-site-key
API_KEY_ENCRYPTION_SECRET=مفتاح-تشفير
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@nexiroflux.com
SMTP_PASS=كلمة_المرور
SMTP_FROM=NEXIRO-FLUX <info@nexiroflux.com>
```

### التشغيل (تطوير)
```bash
cd backend
npm run dev
```

### التشغيل (إنتاج)
```bash
cd backend
pm2 start src/app.js --name nexiro-backend
```

### المنفذ: `3000`

---

## 2️⃣ Website — الموقع الرئيسي (React/Vite)

### التثبيت
```bash
cd website
npm install
```

### التشغيل (تطوير)
```bash
cd website
npm run dev
```

### البناء (إنتاج)
```bash
cd website
npm run build
```
الملفات المبنية في: `website/dist/`

### المنفذ (تطوير): `5174`
### الإنتاج: يُقدَّم عبر Nginx كملفات ثابتة

---

## 3️⃣ Template — قالب المتجر (Next.js)

### التثبيت
```bash
cd website/public/templates/ycz-store
npm install
```

### التشغيل (تطوير)
```bash
cd website/public/templates/ycz-store
npm run dev
```

### البناء (إنتاج)
```bash
cd website/public/templates/ycz-store
rm -rf .next
npm run build
```

### التشغيل (إنتاج)
```bash
cd website/public/templates/ycz-store
pm2 start npm --name ycz-store -- start
```

### المنفذ: `4000`

> ⚠️ **مهم:** بعد كل تحديث يجب مسح `.next` وإعادة البناء

---

## 🚀 التحديث الكامل على السيرفر

### أوامر التحديث (نسخ ولصق)

```bash
# 1. سحب التحديثات
cd /var/www/nexiro-flux
git pull origin master

# 2. تحديث Backend
cd backend
npm install
pm2 restart nexiro-backend

# 3. بناء الموقع الرئيسي
cd ../website
npm install
npm run build

# 4. بناء قالب المتجر
cd public/templates/ycz-store
npm install
rm -rf .next
npm run build
pm2 restart ycz-store

# 5. التحقق
pm2 status
```

---

## 🔄 سكريبت التحديث السريع

يمكنك تشغيل الأمر التالي لتحديث كل شيء مرة واحدة:

```bash
cd /var/www/nexiro-flux && \
git pull origin master && \
cd backend && npm install && pm2 restart nexiro-backend && \
cd ../website && npm install && npm run build && \
cd public/templates/ycz-store && npm install && rm -rf .next && npm run build && pm2 restart ycz-store && \
echo "✅ تم التحديث بنجاح" && pm2 status
```

---

## 🌐 إعداد Nginx (الإنتاج)

### لكل دومين متجر (tenant):
```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # API → Express Backend (3000)
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # كل شيء آخر → Next.js Store (4000)
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### إضافة SSL:
```bash
certbot --nginx -d example.com -d www.example.com
```

### ⚠️ مشكلة شائعة بعد Certbot — HTTP لا يحوّل إلى HTTPS

عند تشغيل `certbot --nginx`، يضيف Certbot تلقائياً server block لـ HTTP (port 80) بهذا الشكل:

```nginx
server {
    if ($host = www.example.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name example.com www.example.com;
    return 404; # managed by Certbot   ← ❌ هذا السطر يسبب المشكلة!
}
```

**المشكلة:** Certbot يتحقق فقط من `www.example.com`، بينما `example.com` بدون www يرجع `404 Not Found` بدلاً من التحويل إلى HTTPS.

**الحل:** بعد كل تشغيل لـ Certbot، يجب تعديل `return 404` إلى `return 301`:

```nginx
server {
    if ($host = www.example.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri; # ← ✅ الإصلاح
}
```

```bash
# للتحقق والتطبيق:
nginx -t && systemctl reload nginx
```

### إضافة دومين جديد تلقائياً:
```bash
python3 /var/www/nexiro-flux/backend/scripts/provision-site.py example.com
```

---

## 📊 المنافذ المستخدمة

| الخدمة | المنفذ | الوصف |
|--------|--------|-------|
| Backend API | 3000 | Express.js |
| Website (dev) | 5174 | Vite dev server |
| Template Store | 4000 | Next.js production |
| Template (dev) | 3333 | Next.js dev server |
| MySQL | 3306 | قاعدة البيانات |

---

## 🔍 مراقبة وتشخيص

```bash
# حالة جميع الخدمات
pm2 status

# سجلات Backend
pm2 logs nexiro-backend

# سجلات Template
pm2 logs ycz-store

# سجلات جميع الخدمات
pm2 logs

# إعادة تشغيل الكل
pm2 restart all
```

---

## ⚠️ ملاحظات مهمة

1. **بعد كل `git pull`:** يجب إعادة بناء Template (`rm -rf .next && npm run build`)
2. **Backend لا يحتاج بناء:** فقط `pm2 restart nexiro-backend`
3. **Website الرئيسي:** `npm run build` ينتج ملفات ثابتة في `dist/`
4. **لا تستخدم `output: standalone`** في Next.js — يسبب فقدان CSS و JS
5. **قاعدة البيانات مشتركة:** جميع المتاجر تستخدم `nexiro_flux_central` مع فصل بـ `site_key`
6. **بعد كل Certbot:** تأكد أن block الـ HTTP (port 80) يحوّل جميع الدومينات إلى HTTPS وليس فقط `www` — راجع قسم "مشكلة شائعة بعد Certbot" أعلاه

---

## 🏢 الفرق بين لوحتي التحكم

| | لوحة إدمن المنصة | لوحة إدمن القالب |
|--|--|--|
| **الرابط** | `nexiroflux.com/admin` | `domain.com/admin` |
| **التقنية** | React/Vite | Next.js |
| **الغرض** | إدارة المنصة ككل | إدارة متجر واحد |
| **البيانات** | جميع المواقع + الاشتراكات + أكواد الشراء | منتجات + طلبات + عملاء الموقع |
| **API** | `GET /api/dashboard/platform-stats` | `GET /api/dashboard/stats` |
| **المنفذ** | يُقدم عبر Vite (dev: 5174) | يُقدم عبر Next.js (prod: 4000) |

---

## 📋 تعليمات طلب التحديثات

> **قبل أي تعديل:** يجب تحديد المنطقة بدقة، ثم فهم البنية الحالية، ثم التنفيذ.

### 1. تحديد المكون المستهدف

| المنطقة | المسار | الوصف |
|---------|--------|-------|
| Backend API | `backend/src/` | Controllers, Routes, Models, Middlewares |
| إدمن المنصة (Overview) | `website/src/pages/admin/AdminOverview.jsx` | لوحة النظرة العامة |
| إدمن المنصة (صفحات) | `website/src/pages/admin/Admin*.jsx` | المستخدمين، التذاكر، المدفوعات... |
| إدمن المنصة (Layout) | `website/src/pages/admin/AdminLayout.jsx` | الشريط الجانبي والهيكل |
| خدمات API | `website/src/services/api.js` | جميع استدعاءات الـ API |
| إدمن القالب | `website/public/templates/ycz-store/src/app/admin/` | لوحة تحكم المتجر |
| واجهة القالب | `website/public/templates/ycz-store/src/app/(store)/` | واجهة المتجر العامة |
| الموقع الرئيسي | `website/src/pages/` | الصفحة الرئيسية، التسجيل، إلخ |

### 2. خريطة تدفق البيانات

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Frontend Page   │────▶│  api.js method    │────▶│  Backend    │
│  (Admin*.jsx)    │     │  (getPlatformStats)│     │  Route      │
└─────────────────┘     └──────────────────┘     └──────┬──────┘
                                                        │
                         ┌──────────────────┐     ┌─────▼──────┐
                         │  Database (MySQL) │◀────│ Controller │
                         │  nexiro_flux_     │     │ + Model    │
                         │  central          │     └────────────┘
                         └──────────────────┘
```

### 3. قواعد التحديث

| القاعدة | التوضيح |
|---------|---------|
| **حدد المنطقة أولاً** | هل التعديل في Backend أم Frontend أم كليهما؟ |
| **حدد الملفات** | أي ملفات بالضبط ستتأثر بالتعديل؟ |
| **افصل المنصة عن القالب** | إدمن المنصة (`/api/dashboard/platform-*`) لا يمر بـ `validateSite` |
| **القالب يستخدم site_key** | كل بيانات القالب مفلترة بـ `site_key` |
| **ابنِ بعد التعديل** | Website: `npm run build` · Template: `rm -rf .next && npm run build` |
| **اختبر قبل الدفع** | تحقق من عدم وجود أخطاء في البناء |

### 4. أمثلة

**طلب:** "حسّن صفحة المدفوعات في إدمن المنصة"
- **المنطقة:** `website/src/pages/admin/AdminPayments.jsx`
- **البيانات:** `api.js → getPayments()` → `backend/src/controllers/paymentController.js`
- **الراوت:** `backend/src/routes/paymentRoutes.js`
- **الملاحظة:** هل يحتاج endpoint عالمي (بدون site_key)؟

**طلب:** "أضف خاصية في متجر القالب"
- **المنطقة:** `website/public/templates/ycz-store/src/`
- **البيانات:** من Next.js frontend → `/api/` → backend controller
- **الملاحظة:** البيانات مفلترة بـ `site_key` تلقائياً
