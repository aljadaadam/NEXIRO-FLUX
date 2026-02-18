#!/bin/bash
# ──────────────────────────────────────────
# NEXIRO-FLUX — سكريبت التحديث والبناء الكامل
# ──────────────────────────────────────────
# الاستخدام:
#   chmod +x update.sh
#   ./update.sh
# ──────────────────────────────────────────

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
WEBSITE_DIR="$ROOT_DIR/website"
TEMPLATE_DIR="$WEBSITE_DIR/public/templates/ycz-store"
HX_TEMPLATE_DIR="$WEBSITE_DIR/public/templates/hx-tools-store"

echo "══════════════════════════════════════"
echo "  NEXIRO-FLUX — تحديث وبناء كامل"
echo "══════════════════════════════════════"
echo ""

# ─── 1. سحب التحديثات ───
echo "📥 [1/5] سحب التحديثات من GitHub..."
cd "$ROOT_DIR"
git pull origin master
echo "✅ تم سحب التحديثات"
echo ""

# ─── 2. تحديث Backend ───
echo "⚙️  [2/5] تحديث Backend..."
cd "$BACKEND_DIR"
npm install --production
if command -v pm2 &> /dev/null; then
  pm2 restart nexiro-backend 2>/dev/null || pm2 start src/app.js --name nexiro-backend
  echo "✅ Backend يعمل (pm2)"
else
  echo "⚠️  PM2 غير مثبت — شغّل Backend يدوياً: cd backend && node src/app.js"
fi
echo ""

# ─── 3. بناء الموقع الرئيسي ───
echo "🌐 [3/5] بناء الموقع الرئيسي (Vite)..."
cd "$WEBSITE_DIR"
npm install
npm run build
echo "✅ تم بناء الموقع → website/dist/"
echo ""

# ─── 4. بناء قالب المتجر ycz-store ───
echo "🏪 [4/6] بناء قالب المتجر ycz-store (Next.js)..."
cd "$TEMPLATE_DIR"
npm install
rm -rf .next
npm run build
if command -v pm2 &> /dev/null; then
  pm2 restart ycz-store 2>/dev/null || pm2 start npm --name ycz-store -- start
  echo "✅ قالب ycz-store يعمل على المنفذ 4000 (pm2)"
else
  echo "⚠️  PM2 غير مثبت — شغّل القالب يدوياً: cd website/public/templates/ycz-store && npm start"
fi
echo ""

# ─── 5. بناء قالب المتجر hx-tools-store ───
echo "🔧 [5/6] بناء قالب المتجر hx-tools-store (Next.js)..."
cd "$HX_TEMPLATE_DIR"
npm install
rm -rf .next
npm run build
if command -v pm2 &> /dev/null; then
  pm2 restart hx-tools-store 2>/dev/null || pm2 start npm --name hx-tools-store -- start
  echo "✅ قالب hx-tools-store يعمل على المنفذ 4002 (pm2)"
else
  echo "⚠️  PM2 غير مثبت — شغّل القالب يدوياً: cd website/public/templates/hx-tools-store && npm start"
fi
echo ""

# ─── 6. التحقق ───
echo "🔍 [6/6] التحقق من الحالة..."
if command -v pm2 &> /dev/null; then
  pm2 status
fi
echo ""

echo "══════════════════════════════════════"
echo "  ✅ تم التحديث الكامل بنجاح!"
echo "══════════════════════════════════════"
echo ""
echo "  Backend API:     http://localhost:3000"
echo "  YCZ Store:       http://localhost:4000"
echo "  HX Tools Store:  http://localhost:4002"
echo ""
