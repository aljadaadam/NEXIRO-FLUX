# NEXIRO-FLUX — دليل النشر

---

## 📁 هيكل المشروع

```
NEXIRO-FLUX/
├── backend/        ← Express API (المنفذ 3000)
│   └── src/
│       ├── config/         (db.js, env.js)
│       ├── controllers/
│       ├── database/       (schema/, migrations/, helpers.js)
│       ├── middlewares/
│       ├── models/
│       ├── routes/         (index.js + route files)
│       ├── services/       (productService, sourceService...)
│       ├── validators/
│       └── app.js
├── website/        ← الموقع الرئيسي (React/Vite)
│   └── src/
│       ├── components/     (common/, demo/, home/, layout/, templates/)
│       ├── hooks/          (usePageLoader, useScrollToTop)
│       ├── routes/         (index.js — lazy imports)
│       └── pages/
├── templates/      ← قوالب المتاجر (Next.js)
│   ├── ycz-store/      (المنفذ 4000)
│   ├── hx-tools-store/ (المنفذ 4002)
│   ├── car-store/      (المنفذ 4003)
│   └── gx-vault/
├── scripts/        ← أدوات (check_api, generate-og...)
├── nginx/          ← إعدادات Nginx
├── docs/           ← التوثيق
├── setup.sh
└── update.sh       ← سكريبت التحديث الشامل
```

---

## 🚀 التحديث على السيرفر

### الطريقة السريعة (سكريبت تلقائي)
```bash
cd /var/www/nexiro-flux
./update.sh
```

### الطريقة اليدوية
```bash
cd /var/www/nexiro-flux
git pull origin master

# Backend
cd backend && npm install --production && pm2 restart nexiro-backend && cd ..

# Website
cd website && npm install && npm run build && cd ..

# Templates
cd templates/ycz-store && npm install && rm -rf .next && npm run build && pm2 restart ycz-store && cd ../..
cd templates/hx-tools-store && npm install && rm -rf .next && npm run build && pm2 restart hx-tools-store && cd ../..
cd templates/car-store && npm install && rm -rf .next && npm run build && pm2 restart car-store && cd ../..

pm2 status
```

---

## 📊 المنافذ

| الخدمة | المنفذ |
|--------|--------|
| Backend API | 3000 |
| ycz-store | 4000 |
| hx-tools-store | 4002 |
| car-store | 4003 |
| MySQL | 3306 |

---

## 🌍 الدومينات

| الدومين | الوصف |
|---------|-------|
| `nexiroflux.com` | الموقع الرئيسي |
| `dash.nexiroflux.com` | لوحة تحكم المنصة (`/admin` فقط) |
| `api.nexiroflux.com` | Backend API |
| `demo.nexiroflux.com` | ديمو YCZ Store |
| `demo-hx.nexiroflux.com` | ديمو HX Tools |
| `demo-car.nexiroflux.com` | ديمو Car Store |
| `demo-gxv.nexiroflux.com` | ديمو GxVault |

---

## 🌐 Nginx — إعداد دومين جديد

```bash
python3 /var/www/nexiro-flux/backend/scripts/provision-site.py example.com
certbot --nginx -d example.com -d www.example.com
```

> بعد Certbot: تأكد أن block الـ HTTP (port 80) يحتوي `return 301 https://$host$request_uri;` وليس `return 404;`

---

## 🔍 مراقبة

```bash
pm2 status              # حالة الخدمات
pm2 logs nexiro-backend # سجلات Backend
pm2 logs ycz-store      # سجلات Template
pm2 restart all         # إعادة تشغيل الكل
```

---

## ⚠️ ملاحظات

- بعد كل `git pull` — يجب `rm -rf .next && npm run build` للقوالب
- Backend لا يحتاج بناء — فقط `pm2 restart`
- Website ينتج ملفات ثابتة في `dist/` تُقدَّم عبر Nginx
- القوالب في `templates/` وليس في `website/public/templates/`
- قاعدة البيانات مشتركة (`nexiro_flux_central`) مع فصل بـ `site_key`

---

## 📋 خريطة الملفات للتعديل

| المنطقة | المسار |
|---------|--------|
| Backend API | `backend/src/controllers/`, `routes/`, `models/`, `services/` |
| Validators | `backend/src/validators/` |
| Database Schema | `backend/src/database/schema/` |
| إدمن المنصة | `website/src/pages/admin/` |
| الموقع الرئيسي | `website/src/pages/`, `components/`, `hooks/` |
| خدمات API (frontend) | `website/src/services/api.js` |
| واجهة قالب المتجر | `templates/ycz-store/src/app/(store)/` |
| إدمن القالب | `templates/ycz-store/src/app/admin/` |
| API القالب | `templates/ycz-store/src/lib/api.ts` |
