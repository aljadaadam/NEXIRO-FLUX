#!/bin/bash
# ──────────────────────────────────────────
# NEXIRO-FLUX — سكريبت الإعداد الأولي
# ──────────────────────────────────────────
# يشغّل مرة واحدة أول ما تنزل المشروع على سيرفر جديد
#
# الاستخدام:
#   chmod +x setup.sh
#   ./setup.sh
# ──────────────────────────────────────────

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "══════════════════════════════════════"
echo "  NEXIRO-FLUX — الإعداد الأولي"
echo "══════════════════════════════════════"
echo ""

# ─── التحقق من Node.js ───
if ! command -v node &> /dev/null; then
  echo "❌ Node.js غير مثبت. ثبّته أولاً:"
  echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
  echo "   sudo apt install -y nodejs"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js: $NODE_VERSION"

# ─── تثبيت PM2 ───
if ! command -v pm2 &> /dev/null; then
  echo "📦 تثبيت PM2..."
  npm install -g pm2
fi
echo "✅ PM2: $(pm2 -v)"

# ─── 1. تثبيت Backend ───
echo ""
echo "⚙️  [1/3] تثبيت Backend..."
cd "$ROOT_DIR/backend"
npm install --production

if [ ! -f .env ]; then
  echo ""
  echo "⚠️  أنشئ ملف backend/.env وعدّل القيم:"
  echo "──────────────────────────────"
  cat <<'ENVTEMPLATE'
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=nexiro_flux_central
DB_PORT=3306
JWT_SECRET=YOUR_SECRET_KEY
JWT_EXPIRES_IN=7d
SITE_KEY=YOUR_SITE_KEY
API_KEY_ENCRYPTION_SECRET=YOUR_ENCRYPTION_KEY
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@nexiroflux.com
SMTP_PASS=YOUR_SMTP_PASSWORD
SMTP_FROM=NEXIRO-FLUX <info@nexiroflux.com>
ENVTEMPLATE
  echo "──────────────────────────────"
fi
echo "✅ Backend جاهز"

# ─── 2. تثبيت وبناء الموقع الرئيسي ───
echo ""
echo "🌐 [2/3] تثبيت وبناء الموقع الرئيسي..."
cd "$ROOT_DIR/website"
npm install
npm run build
echo "✅ الموقع الرئيسي جاهز → website/dist/"

# ─── 3. تثبيت وبناء قالب المتجر ───
echo ""
echo "🏪 [3/3] تثبيت وبناء قالب المتجر..."
cd "$ROOT_DIR/website/public/templates/ycz-store"
npm install
rm -rf .next
npm run build
echo "✅ قالب المتجر جاهز"

# ─── تشغيل الخدمات ───
echo ""
echo "🚀 تشغيل الخدمات..."
cd "$ROOT_DIR/backend"
pm2 start src/app.js --name nexiro-backend

cd "$ROOT_DIR/website/public/templates/ycz-store"
pm2 start npm --name ycz-store -- start

pm2 save
echo ""

# ─── النتيجة ───
echo "══════════════════════════════════════"
echo "  ✅ الإعداد الأولي تم بنجاح!"
echo "══════════════════════════════════════"
echo ""
echo "  الخدمات العاملة:"
pm2 status
echo ""
echo "  الخطوة التالية:"
echo "  • أنشئ ملف backend/.env (إذا لم يكن موجوداً)"
echo "  • أعد تشغيل: pm2 restart all"
echo "  • أضف دومين: python3 backend/scripts/provision-site.py example.com"
echo ""
echo "  للتحديثات المستقبلية استخدم:"
echo "    ./update.sh"
echo ""
