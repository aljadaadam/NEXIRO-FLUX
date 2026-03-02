/**
 * ─── Bot & Abuse Protection Middleware ───
 * 
 * 1. يحظر User-Agents المعروفة للبوتات الضارة
 * 2. يحظر الطلبات بدون User-Agent
 * 3. يراقب IPs المشبوهة ويحظرها تلقائياً (IP auto-ban)
 * 4. يسجل الطلبات المشبوهة
 */

// ─── قائمة User-Agents المحظورة (بوتات ضارة / سكربتات) ───
const BLOCKED_UA_PATTERNS = [
  /python-requests/i,
  /python-urllib/i,
  /scrapy/i,
  /httpclient/i,
  /java\//i,
  /libwww-perl/i,
  /wget/i,
  /curl/i,
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /gobuster/i,
  /dirbuster/i,
  /nuclei/i,
  /httpx/i,
  /census/i,
  /semrush/i,
  /ahref/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /gptbot/i,
  /claudebot/i,
  /ccbot/i,
  /dataforseo/i,
];

// ─── مسارات مشبوهة (عادة تُفحص من البوتات) ───
const SUSPICIOUS_PATHS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-content/i,
  /\/xmlrpc\.php/i,
  /\/phpmyadmin/i,
  /\/admin\.php/i,
  /\/config\.php/i,
  /\/\.well-known\/(?!acme-challenge)/i,
  /\/cgi-bin/i,
  /\/shell/i,
  /\/eval/i,
  /\/exec/i,
  /\/passwd/i,
  /\/etc\//i,
];

// ─── نظام حظر IP تلقائي ───
// يُحصي عدد الطلبات المشبوهة لكل IP — إذا تجاوز الحد يُحظر مؤقتاً
const suspiciousHits = new Map();   // IP → { count, firstHit }
const bannedIPs = new Map();        // IP → banExpiry (timestamp)

const SUSPICIOUS_THRESHOLD = 20;     // عدد الطلبات المشبوهة قبل الحظر
const SUSPICIOUS_WINDOW = 60 * 1000; // نافذة الفحص: 1 دقيقة
const BAN_DURATION = 30 * 60 * 1000; // مدة الحظر: 30 دقيقة
const MAX_BANNED = 10000;            // أقصى عدد IPs محظورة (لمنع memory leak)

// تنظيف دوري كل 5 دقائق
setInterval(() => {
  const now = Date.now();
  for (const [ip, expiry] of bannedIPs) {
    if (now > expiry) bannedIPs.delete(ip);
  }
  for (const [ip, data] of suspiciousHits) {
    if (now - data.firstHit > SUSPICIOUS_WINDOW * 2) suspiciousHits.delete(ip);
  }
}, 5 * 60 * 1000);

function recordSuspicious(ip) {
  const now = Date.now();
  const entry = suspiciousHits.get(ip);

  if (!entry || now - entry.firstHit > SUSPICIOUS_WINDOW) {
    suspiciousHits.set(ip, { count: 1, firstHit: now });
    return false;
  }

  entry.count++;
  if (entry.count >= SUSPICIOUS_THRESHOLD) {
    // حظر الـ IP
    if (bannedIPs.size < MAX_BANNED) {
      bannedIPs.set(ip, now + BAN_DURATION);
      console.warn(`[botProtection] 🚫 Auto-banned IP: ${ip} (${entry.count} suspicious hits in ${SUSPICIOUS_WINDOW / 1000}s)`);
    }
    suspiciousHits.delete(ip);
    return true;
  }

  return false;
}

/**
 * Middleware رئيسي لحماية البوتات
 */
function botProtection(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;

  // 1. فحص IP محظور
  const banExpiry = bannedIPs.get(ip);
  if (banExpiry) {
    if (Date.now() < banExpiry) {
      return res.status(403).json({ 
        error: 'تم حظر الوصول مؤقتاً بسبب نشاط مشبوه',
        errorEn: 'Access temporarily blocked due to suspicious activity'
      });
    }
    bannedIPs.delete(ip);
  }

  const ua = req.headers['user-agent'] || '';

  // 2. حظر طلبات بدون User-Agent (عادة سكربتات)
  if (!ua && req.path.startsWith('/api/')) {
    // السماح لل webhooks بدون UA (مثلاً Binance callbacks)
    const webhookPaths = ['/api/checkout/webhooks/', '/api/health/'];
    if (!webhookPaths.some(p => req.path.startsWith(p))) {
      recordSuspicious(ip);
      return res.status(403).json({ 
        error: 'طلب غير مسموح',
        errorEn: 'Request not allowed'
      });
    }
  }

  // 3. فحص User-Agent ضار
  if (ua && BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
    recordSuspicious(ip);
    return res.status(403).json({ 
      error: 'الوصول محظور',
      errorEn: 'Access denied'
    });
  }

  // 4. فحص مسارات مشبوهة
  if (SUSPICIOUS_PATHS.some(p => p.test(req.path))) {
    recordSuspicious(ip);
    return res.status(404).json({ error: 'غير موجود' });
  }

  next();
}

/**
 * Endpoint لعرض حالة الحظر (للأدمن فقط)
 */
function getBanStatus(req, res) {
  const now = Date.now();
  const activeBans = [];
  for (const [ip, expiry] of bannedIPs) {
    if (now < expiry) {
      activeBans.push({ ip, expiresIn: Math.round((expiry - now) / 1000) + 's' });
    }
  }
  res.json({
    activeBans: activeBans.length,
    bans: activeBans,
    suspiciousTracked: suspiciousHits.size
  });
}

/**
 * حظر IP يدوي (للأدمن)
 */
function manualBan(req, res) {
  const { ip, duration } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP مطلوب' });
  const dur = (duration || 60) * 60 * 1000; // default 1 hour
  bannedIPs.set(ip, Date.now() + dur);
  console.warn(`[botProtection] 🚫 Manual ban: ${ip} for ${duration || 60} minutes by admin ${req.user?.id}`);
  res.json({ message: `تم حظر ${ip} لمدة ${duration || 60} دقيقة` });
}

/**
 * رفع الحظر عن IP (للأدمن)
 */
function manualUnban(req, res) {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP مطلوب' });
  bannedIPs.delete(ip);
  suspiciousHits.delete(ip);
  res.json({ message: `تم رفع الحظر عن ${ip}` });
}

module.exports = { 
  botProtection, 
  getBanStatus, 
  manualBan, 
  manualUnban 
};
