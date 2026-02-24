const Source = require('../models/Source');
const Product = require('../models/Product');
const { decryptApiKey, apiKeyLast4, apiKeyMaskedHyphenated } = require('../utils/apiKeyCrypto');
const { getPool } = require('../config/db');
const { DhruFusionClient, DhruFusionError } = require('../services/dhruFusion');
const { ImeiCheckClient, ImeiCheckError } = require('../services/imeiCheck');
const { invalidatePublicProductsCache } = require('./productController');

function isPrivateOrLocalHostname(hostname) {
  const host = String(hostname || '').trim().toLowerCase();
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host === '0.0.0.0' || host === '127.0.0.1' || host === '::1') return true;
  // Basic private IPv4 checks (SSRF hardening)
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  const m = host.match(/^172\.(\d{1,3})\./);
  if (m) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

// ─── اكتشاف رابط API تلقائياً ───
// المسارات الشائعة لأنظمة DHRU FUSION
const COMMON_API_PATHS = [
  '/api/index.php',
  '/api/',
  '/index.php',
  '/api/v2',
  '/api/v1',
  '/reseller/api/index.php',
];

/**
 * يحاول اكتشاف رابط API الصحيح من رابط الموقع الأساسي
 * مثال: https://sd-unlocker.com → https://sd-unlocker.com/api/index.php
 */
async function resolveApiUrl(inputUrl, apiKey, username) {
  let base = inputUrl.trim().replace(/\/+$/, '');

  // إذا كان الرابط يحتوي بالفعل على مسار API، جرّبه أولاً
  const parsed = new URL(base);
  const hasApiPath = parsed.pathname && parsed.pathname !== '/' && parsed.pathname.length > 1;

  // جرّب الرابط كما هو أولاً
  const tryUrl = async (url) => {
    try {
      const body = new URLSearchParams({
        action: 'accountinfo',
        requestformat: 'JSON',
        ...(apiKey ? { apiaccesskey: apiKey } : {}),
        ...(username ? { username } : {}),
      });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json?.SUCCESS || json?.success) return url;
      } catch { /* not JSON */ }
      return null;
    } catch {
      return null;
    }
  };

  // 1) جرّب الرابط كما أدخله المستخدم
  if (hasApiPath) {
    const result = await tryUrl(base);
    if (result) return result;
  }

  // 2) جرّب المسارات الشائعة
  const origin = parsed.origin; // https://sd-unlocker.com
  for (const path of COMMON_API_PATHS) {
    const candidate = origin + path;
    if (candidate === base) continue; // تم اختباره بالفعل
    const result = await tryUrl(candidate);
    if (result) return result;
  }

  // 3) آخر محاولة: الرابط كما هو (بدون مسار)
  if (!hasApiPath) {
    const result = await tryUrl(base);
    if (result) return result;
  }

  // لم يتم العثور على رابط صالح — أعد الرابط الأصلي
  return base;
}

// دالة فلترة المنتجات حسب نوع الخدمة وخيارات Setup
function checkSetupFilter(serviceType, setupIMEI, setupServer, setupRemote) {
  // إذا لم يتم اختيار أي setup option، نقبل جميع المنتجات
  if (!setupIMEI && !setupServer && !setupRemote) {
    return true;
  }
  
  const type = String(serviceType || 'SERVER').toUpperCase();
  
  if (setupIMEI && type === 'IMEI') return true;
  if (setupServer && type === 'SERVER') return true;
  if (setupRemote && type === 'REMOTE') return true;
  
  return false;
}

function parseAccountInfo(raw) {
  const success = raw?.SUCCESS;
  const first = Array.isArray(success) ? success[0] : (success && typeof success === 'object' ? success : null);

  // DHRU FUSION: AccoutInfo (typo in API) / AccountInfo / accountinfo
  const accountInfo = first?.AccountInfo || first?.AccoutInfo || first?.accountinfo || null;

  const email =
    accountInfo?.mail ||
    first?.EMAIL ||
    first?.email ||
    first?.AccountEmail ||
    first?.account_email ||
    null;

  const credits =
    accountInfo?.creditraw ||
    accountInfo?.credit ||
    first?.CREDITS ||
    first?.credits ||
    first?.Balance ||
    first?.balance ||
    null;

  const currency =
    accountInfo?.currency ||
    first?.CURRENCY ||
    first?.currency ||
    null;

  const credit = accountInfo?.credit || null;
  const creditraw = accountInfo?.creditraw || null;
  return {
    email: email ?? null,
    credits: credits ?? null,
    credit: credit ?? null,
    creditraw: creditraw ?? null,
    currency: currency ?? null
  };
}

function extractGroupsList(raw) {
  // Expected: { SUCCESS: [ { LIST: { "Group": {GROUPNAME, GROUPTYPE, SERVICES:{...}} } } ] }
  const success = raw?.SUCCESS;
  const first = Array.isArray(success) ? success[0] : (success && typeof success === 'object' ? success : null);
  const list = first?.LIST;
  if (list && typeof list === 'object') return list;
  return null;
}

async function postResellerAction({ baseUrl, apiKey, action, extraBody }) {
  const body = new URLSearchParams({
    action,
    ...(apiKey ? { apiaccesskey: apiKey } : {}),
    ...(extraBody || {})
  });

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body,
    timeout: 15000
  });

  return response;
}

// جلب جميع المصادر
async function getAllSources(req, res) {
  try {
    const { site_key } = req.user;
    const sources = await Source.findBySiteKey(site_key);
    const counts = await Product.countBySources(
      site_key,
      sources.map(s => s.id)
    );

    const mapped = sources.map((s) => {
      const plain = decryptApiKey(s.api_key);
      const last4 = s.api_key_last4 || apiKeyLast4(plain);
      const apiKeyMasked = plain ? apiKeyMaskedHyphenated(plain) : null;
      const lastOk = s.last_connection_ok;
      const connectionStatus =
        lastOk === null || lastOk === undefined
          ? 'unknown'
          : (Number(lastOk) === 1 ? 'connected' : 'disconnected');

      return {
        id: s.id,
        name: s.name,
        type: s.type,
        url: s.url,
        username: s.username || null,
        apiKeyLast4: last4 || null,
        apiKeyMasked,
        profitPercentage: s.profit_percentage == null ? 0 : Number(s.profit_percentage),
        profitAmount: s.profit_amount == null ? null : Number(s.profit_amount),
        syncOnly: s.sync_only === 1 || s.sync_only === true,
        productsCount: counts[String(s.id)] || 0,
        connectionStatus,
        lastConnectionOk: lastOk === null || lastOk === undefined ? null : Boolean(Number(lastOk)),
        lastConnectionCheckedAt: s.last_connection_checked_at
          ? new Date(s.last_connection_checked_at).toISOString()
          : null,
        lastConnectionError: s.last_connection_error || null,
        lastAccountBalance: s.last_account_balance || null,
        lastAccountCurrency: s.last_account_currency || null
      };
    });

    res.json(mapped);
  } catch (error) {
    console.error('Error in getAllSources:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب المصادر' 
    });
  }
}

// إنشاء مصدر جديد
async function createSource(req, res) {
  try {
    const { site_key } = req.user;
    const {
      name,
      type,
      url,
      apiUrl,
      username,
      apiKey,
      profitPercentage,
      profitAmount,
      description,
      syncOnly
    } = req.body;

    const isImeiCheck = type === 'imeicheck';
    let finalUrl = isImeiCheck
      ? (url || apiUrl || 'https://alpha.imeicheck.com/api/php-api')
      : (url || apiUrl);

    // التحقق من المدخلات
    if (!name || !type || (!finalUrl && !isImeiCheck)) {
      return res.status(400).json({ 
        error: 'الاسم والنوع والرابط مطلوبة' 
      });
    }

    // أنواع المصادر المدعومة
    const validTypes = ['dhru-fusion', 'sd-unlocker', 'unlock-world', 'custom-api', 'imeicheck'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: `النوع يجب أن يكون أحد: ${validTypes.join(', ')}` 
      });
    }

    // ─── IMEI Check: اختبار الاتصال عبر endpoint الرصيد ───
    if (isImeiCheck && apiKey) {
      try {
        const client = new ImeiCheckClient({ apiKey, baseUrl: finalUrl });
        const balanceInfo = await client.getBalance();
        console.log(`✅ IMEI Check connection test passed — Balance: ${balanceInfo.balance} ${balanceInfo.currency}`);
      } catch (connErr) {
        console.error('❌ IMEI Check connection validation failed:', connErr.message);
        let userError = 'فشل الاتصال بمصدر IMEI Check';
        const errMsg = String(connErr.message || '').toLowerCase();

        if (errMsg.includes('invalid') && errMsg.includes('key')) {
          userError = 'مفتاح الـ API غير صحيح — تأكد من نسخه من لوحة تحكم IMEI Check';
        } else if (errMsg.includes('wrong ip') || errMsg.includes('ip')) {
          userError = 'عنوان IP السيرفر غير مسموح — أضف IP السيرفر في إعدادات IMEI Check';
        } else if (errMsg.includes('credit') || errMsg.includes('balance')) {
          userError = 'رصيد الحساب غير كافٍ';
        } else if (errMsg.includes('timeout') || errMsg.includes('مهلة') || errMsg.includes('aborted')) {
          userError = 'انتهت مهلة الاتصال — جرّب مرة أخرى';
        } else if (errMsg.includes('enotfound') || errMsg.includes('econnrefused') || errMsg.includes('dns')) {
          userError = 'لا يمكن الوصول إلى IMEI Check — تأكد من صحة الرابط';
        } else if (connErr.name === 'ImeiCheckError' && connErr.message) {
          userError = `خطأ من IMEI Check: ${connErr.message}`;
        }

        return res.status(400).json({ error: userError, detail: connErr.message });
      }
    }

    // ─── DHRU FUSION وأشباهه: اكتشاف رابط API + اختبار اتصال ───
    if (!isImeiCheck) {
      try {
        finalUrl = await resolveApiUrl(finalUrl, apiKey, username);
        console.log(`✅ Resolved API URL: ${finalUrl}`);
      } catch (e) {
        console.error('⚠️ resolveApiUrl failed (non-blocking):', e.message);
      }

      if (apiKey) {
        try {
          const client = new DhruFusionClient({
            baseUrl: finalUrl,
            username: username || '',
            apiAccessKey: apiKey,
          });
          await client.getAccountInfo();
          console.log(`✅ Connection test passed for: ${finalUrl}`);
        } catch (connErr) {
          console.error('❌ Connection validation failed:', connErr.message);
          let userError = 'فشل الاتصال بالمصدر';
          const errMsg = String(connErr.message || '').toLowerCase();
          const errFull = String(connErr.fullDescription || '').toLowerCase();
          const combined = errMsg + ' ' + errFull;

          if (combined.includes('invalid api') || combined.includes('invalid key') || combined.includes('api access key') || combined.includes('apiaccesskey')) {
            userError = 'مفتاح الـ API غير صحيح — تأكد من نسخه بالكامل من لوحة تحكم المصدر';
          } else if (combined.includes('invalid username') || combined.includes('incorrect username') || combined.includes('wrong username') || combined.includes('user not found') || combined.includes('username')) {
            userError = 'اسم المستخدم غير صحيح — تأكد من إدخال اسم المستخدم الصحيح في لوحة المصدر';
          } else if (combined.includes('ip') && (combined.includes('not allowed') || combined.includes('whitelist') || combined.includes('blocked') || combined.includes('not whitelisted') || combined.includes('not authorized'))) {
            userError = 'عنوان IP السيرفر غير مسموح — أضف عنوان IP الخاص بالسيرفر في إعدادات API بلوحة تحكم المصدر';
          } else if (combined.includes('suspended') || combined.includes('disabled') || combined.includes('banned')) {
            userError = 'الحساب معطّل أو موقوف في المصدر — تواصل مع دعم المصدر';
          } else if (combined.includes('insufficient') || combined.includes('no credit') || combined.includes('balance')) {
            userError = 'رصيد الحساب غير كافٍ في المصدر';
          } else if (combined.includes('timeout') || combined.includes('مهلة') || combined.includes('timed out') || combined.includes('aborted')) {
            userError = 'انتهت مهلة الاتصال — تأكد من أن رابط المصدر صحيح ويعمل';
          } else if (combined.includes('enotfound') || combined.includes('econnrefused') || combined.includes('dns') || combined.includes('getaddrinfo')) {
            userError = 'لا يمكن الوصول إلى المصدر — تأكد من صحة الرابط';
          } else if (combined.includes('non-json') || combined.includes('غير json')) {
            userError = 'المصدر لا يرد بصيغة JSON — تأكد من صحة رابط الـ API';
          } else if (connErr.name === 'DhruFusionError') {
            userError = `خطأ من المصدر: ${connErr.message}`;
            if (connErr.fullDescription) {
              userError += ` — ${connErr.fullDescription}`;
            }
          }

          return res.status(400).json({ error: userError, detail: connErr.message });
        }
      }
    }

    const source = await Source.create({
      site_key,
      name,
      type,
      url: finalUrl,
      username: username || null,
      apiKey: apiKey ?? null,
      profitPercentage: profitPercentage ?? 0,
      profitAmount: profitAmount ?? null,
      description: description || '',
      syncOnly: syncOnly ?? false
    });

    // تحديث حالة الاتصال بعد الإنشاء الناجح
    if (apiKey) {
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: true,
        checkedAt: new Date(),
        error: null,
      });
    }

    const productsCount = await Product.countBySource(site_key, source.id);
    const last4 = source.api_key_last4 || (apiKey ? apiKeyLast4(apiKey) : null);
    const apiKeyMasked = apiKey ? apiKeyMaskedHyphenated(apiKey) : null;

    res.status(201).json({
      message: 'تم إنشاء المصدر بنجاح',
      source: {
        id: source.id,
        name: source.name,
        type: source.type,
        url: source.url,
        username: source.username || null,
        apiKeyLast4: last4 || null,
        apiKeyMasked,
        profitPercentage: source.profit_percentage == null ? 0 : Number(source.profit_percentage),
        syncOnly: source.sync_only === 1 || source.sync_only === true,
        productsCount,
        connectionStatus: apiKey ? 'connected' : 'unknown',
        lastConnectionOk: apiKey ? true : null,
        lastConnectionCheckedAt: apiKey ? new Date().toISOString() : null,
        lastConnectionError: null
      }
    });
  } catch (error) {
    console.error('Error in createSource:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء إنشاء المصدر' 
    });
  }
}

// تحديث مصدر
async function updateSource(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const {
      name,
      type,
      url,
      apiUrl,
      username,
      apiKey,
      profitPercentage,
      profitAmount,
      description,
      syncOnly
    } = req.body;

    let finalUrl = type === 'imeicheck'
      ? (url || apiUrl || 'https://alpha.imeicheck.com/api/php-api')
      : (url || apiUrl);

    // التحقق من المدخلات
    if (!name || !type || (!finalUrl && type !== 'imeicheck')) {
      return res.status(400).json({ 
        error: 'الاسم والنوع والرابط مطلوبة' 
      });
    }

    // ─── اكتشاف رابط API تلقائياً (DHRU FUSION فقط) ───
    if (type !== 'imeicheck') {
      try {
        finalUrl = await resolveApiUrl(finalUrl, apiKey, username);
      } catch (e) {
        console.error('⚠️ resolveApiUrl failed (non-blocking):', e.message);
      }
    }

    const source = await Source.update(id, site_key, {
      name,
      type,
      url: finalUrl,
      username,
      apiKey,
      profitPercentage,
      profitAmount,
      description,
      syncOnly
    });

    if (!source) {
      return res.status(404).json({ 
        error: 'المصدر غير موجود أو ليس لديك صلاحية لتعديله' 
      });
    }

    const productsCount = await Product.countBySource(site_key, source.id);
    const lastOk = source.last_connection_ok;
    const connectionStatus =
      lastOk === null || lastOk === undefined
        ? 'unknown'
        : (Number(lastOk) === 1 ? 'connected' : 'disconnected');

    const apiKeyMasked = source.api_key_last4 ? 'XXX-XXX-XXX-XXX-XXX-XXX-XXX-XXX' : null;

    res.json({
      message: 'تم تحديث المصدر بنجاح',
      source: {
        id: source.id,
        name: source.name,
        type: source.type,
        url: source.url,
        username: source.username || null,
        apiKeyLast4: source.api_key_last4 || null,
        apiKeyMasked,
        profitPercentage: source.profit_percentage == null ? 0 : Number(source.profit_percentage),
        syncOnly: source.sync_only === 1 || source.sync_only === true,
        productsCount,
        connectionStatus,
        lastConnectionOk: lastOk === null || lastOk === undefined ? null : Boolean(Number(lastOk)),
        lastConnectionCheckedAt: source.last_connection_checked_at
          ? new Date(source.last_connection_checked_at).toISOString()
          : null,
        lastConnectionError: source.last_connection_error || null
      }
    });
  } catch (error) {
    console.error('Error in updateSource:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء تحديث المصدر' 
    });
  }
}

// حذف مصدر
async function deleteSource(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;

    const deleted = await Source.delete(id, site_key);

    if (!deleted) {
      return res.status(404).json({ 
        error: 'المصدر غير موجود' 
      });
    }

    res.json({
      message: 'تم حذف المصدر بنجاح'
    });
  } catch (error) {
    console.error('Error in deleteSource:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء حذف المصدر' 
    });
  }
}

async function getSourceStats(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;

    const source = await Source.findById(id);
    if (!source || source.site_key !== site_key) {
      return res.status(404).json({ error: 'المصدر غير موجود' });
    }

    const productsCount = await Product.countBySource(site_key, source.id);
    const lastOk = source.last_connection_ok;

    res.json({
      productsCount,
      connectionOk: lastOk === null || lastOk === undefined ? null : Boolean(Number(lastOk))
    });
  } catch (error) {
    console.error('Error in getSourceStats:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب إحصائيات المصدر' });
  }
}

async function testSourceConnection(req, res) {
  const checkedAt = new Date();
  try {
    const { site_key } = req.user;
    const { id } = req.params;

    const source = await Source.findById(id);
    if (!source || source.site_key !== site_key) {
      return res.status(404).json({ error: 'المصدر غير موجود' });
    }

    let baseUrl = req.body?.url || req.body?.apiUrl || source.url;
    const apiKeyPlain = req.body?.apiKey || req.body?.api_key || decryptApiKey(source.api_key);
    const username = req.body?.username || source.username || null;

    // ─── IMEI Check: اختبار عبر endpoint الرصيد ───
    if (source.type === 'imeicheck') {
      try {
        const client = new ImeiCheckClient({ apiKey: apiKeyPlain, baseUrl });
        const balanceInfo = await client.getBalance();

        await Source.updateConnectionStatus(source.id, site_key, {
          ok: true,
          checkedAt,
          error: null,
          balance: balanceInfo.balance,
          currency: balanceInfo.currency,
        });

        return res.json({
          success: true,
          connectionOk: true,
          resolvedUrl: baseUrl,
          sourceBalance: balanceInfo.balance,
          sourceCurrency: balanceInfo.currency,
          lastChecked: checkedAt.toISOString(),
        });
      } catch (error) {
        console.error('IMEI Check test failed:', error.message);
        let userError = 'فشل الاتصال بـ IMEI Check';
        const errMsg = String(error.message || '').toLowerCase();
        if (errMsg.includes('invalid') && errMsg.includes('key')) {
          userError = 'مفتاح الـ API غير صحيح';
        } else if (errMsg.includes('ip')) {
          userError = 'عنوان IP السيرفر غير مسموح في IMEI Check';
        } else if (errMsg.includes('timeout') || errMsg.includes('مهلة')) {
          userError = 'انتهت مهلة الاتصال';
        }

        await Source.updateConnectionStatus(source.id, site_key, {
          ok: false,
          checkedAt,
          error: error.message,
        });

        return res.json({
          success: true,
          connectionOk: false,
          error: userError,
          lastChecked: checkedAt.toISOString(),
        });
      }
    }

    // ─── DHRU FUSION: اكتشاف رابط API تلقائياً ───
    try {
      const resolvedUrl = await resolveApiUrl(baseUrl, apiKeyPlain, username);
      if (resolvedUrl !== baseUrl) {
        console.log(`✅ Auto-resolved API URL: ${baseUrl} → ${resolvedUrl}`);
        baseUrl = resolvedUrl;
        // تحديث الرابط في قاعدة البيانات
        await Source.update(source.id, source.site_key, { url: resolvedUrl });
      }
    } catch (e) {
      console.error('⚠️ resolveApiUrl failed (non-blocking):', e.message);
    }

    const logs = [];
    logs.push('Black List domain check.....');
    let parsedUrl;
    try {
      parsedUrl = new URL(baseUrl);
    } catch {
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt,
        error: 'Invalid URL'
      });
      return res.status(400).json({ success: false, connectionOk: false, error: 'رابط المصدر غير صالح' });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol) || isPrivateOrLocalHostname(parsedUrl.hostname)) {
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt,
        error: 'Blocked URL'
      });
      return res.status(400).json({ success: false, connectionOk: false, error: 'هذا الرابط غير مسموح لأسباب أمنية' });
    }
    logs.push('OK');

    const response = await postResellerAction({
      baseUrl,
      apiKey: apiKeyPlain,
      action: 'accountinfo',
      extraBody: {
        ...(username ? { username } : {}),
        // SD-Unlocker expects requestformat=JSON; harmless for other providers
        requestformat: 'JSON'
      }
    });

    if (!response.ok) {
      const err = `${response.status} ${response.statusText}`;
      let userError = 'فشل الاتصال بالمصدر';
      if (response.status === 403) {
        userError = 'المصدر رفض الاتصال — قد يكون عنوان IP السيرفر غير مسموح';
      } else if (response.status === 401) {
        userError = 'بيانات الدخول غير صحيحة — تأكد من اسم المستخدم ومفتاح API';
      } else if (response.status === 404) {
        userError = 'رابط الـ API غير صحيح — المسار غير موجود في المصدر';
      } else if (response.status >= 500) {
        userError = 'المصدر يعاني من مشكلة داخلية — جرّب لاحقاً';
      }
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt,
        error: err
      });
      
      // Return last known good data if available
      const lastSource = await Source.findById(id);
      return res.json({
        success: true,
        connectionOk: false,
        sourceBalance: lastSource?.last_account_balance || null,
        sourceCurrency: lastSource?.last_account_currency || null,
        error: userError,
        lastChecked: checkedAt.toISOString()
      });
    }

    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    const rawText = await response.text();
    let payload;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      const snippet = rawText ? rawText.slice(0, 160).replace(/\s+/g, ' ').trim() : '';
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt,
        error: `Non-JSON response${contentType ? ` (${contentType})` : ''}${snippet ? `: ${snippet}` : ''}`
      });
      
      // Return last known good data if available
      const lastSource = await Source.findById(id);
      return res.json({
        success: true,
        connectionOk: false,
        sourceBalance: lastSource?.last_account_balance || null,
        sourceCurrency: lastSource?.last_account_currency || null,
        error: 'استجابة غير صالحة من المصدر',
        lastChecked: checkedAt.toISOString()
      });
    }

    // Minimal validation: allow SUCCESS to be array OR object
    const root = payload?.DHRUFUSION || payload;
    const errorBlock = root?.ERROR || payload?.ERROR;
    const success = root?.SUCCESS || payload?.SUCCESS;
    const successOk = Array.isArray(success) || (success && typeof success === 'object');

    // ─── فحص أخطاء DHRU FUSION المفصّلة ───
    if (errorBlock) {
      const err = Array.isArray(errorBlock) ? errorBlock[0] : errorBlock;
      const errMessage = err?.MESSAGE || err?.message || JSON.stringify(err);
      const errFull = err?.FULL_DESCRIPTION || err?.full_description || '';
      const combined = (errMessage + ' ' + errFull).toLowerCase();

      let userError = 'فشل الاتصال بالمصدر';
      if (combined.includes('invalid api') || combined.includes('invalid key') || combined.includes('apiaccesskey')) {
        userError = 'مفتاح الـ API غير صحيح — تأكد من نسخه بالكامل من لوحة تحكم المصدر';
      } else if (combined.includes('invalid username') || combined.includes('incorrect username') || combined.includes('wrong username') || combined.includes('user not found')) {
        userError = 'اسم المستخدم غير صحيح — تأكد من إدخال اسم المستخدم الصحيح في لوحة المصدر';
      } else if (combined.includes('ip') && (combined.includes('not allowed') || combined.includes('whitelist') || combined.includes('blocked') || combined.includes('not whitelisted') || combined.includes('not authorized'))) {
        userError = 'عنوان IP السيرفر غير مسموح — أضف عنوان IP الخاص بالسيرفر في إعدادات API بلوحة تحكم المصدر';
      } else if (combined.includes('suspended') || combined.includes('disabled') || combined.includes('banned')) {
        userError = 'الحساب معطّل أو موقوف في المصدر — تواصل مع دعم المصدر';
      } else if (errMessage && errMessage.length > 0 && errMessage !== '{}') {
        userError = `خطأ من المصدر: ${errMessage}`;
        if (errFull) userError += ` — ${errFull}`;
      }

      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt,
        error: errMessage
      });

      const lastSource = await Source.findById(id);
      return res.json({
        success: true,
        connectionOk: false,
        sourceBalance: lastSource?.last_account_balance || null,
        sourceCurrency: lastSource?.last_account_currency || null,
        error: userError,
        detail: errMessage,
        lastChecked: checkedAt.toISOString()
      });
    }

    if (!successOk) {
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt,
        error: 'Unexpected reseller response (missing SUCCESS)'
      });
      
      // Return last known good data if available
      const lastSource = await Source.findById(id);
      return res.json({
        success: true,
        connectionOk: false,
        sourceBalance: lastSource?.last_account_balance || null,
        sourceCurrency: lastSource?.last_account_currency || null,
        error: 'فشل الاتصال',
        lastChecked: checkedAt.toISOString()
      });
    }

    const account = parseAccountInfo(payload);
    const apiVersion = payload?.apiversion || payload?.apiVersion || payload?.APIVERSION || null;

    // Extract balance and currency for storage
    const balance = account.creditraw || account.credits || null;
    const currency = account.currency || null;

    await Source.updateConnectionStatus(source.id, site_key, {
      ok: true,
      checkedAt,
      error: null,
      balance,
      currency
    });

    // Return simple response for dashboard
    return res.json({
      success: true,
      connectionOk: true,
      resolvedUrl: baseUrl,
      sourceBalance: balance,
      sourceCurrency: currency,
      lastChecked: checkedAt.toISOString()
    });
  } catch (error) {
    console.error('Error in testSourceConnection:', error);
    // ─── ترجمة الأخطاء إلى رسائل واضحة ───
    let userError = 'فشل الاتصال بالمصدر';
    const errMsg = String(error.message || '').toLowerCase();
    if (errMsg.includes('enotfound') || errMsg.includes('getaddrinfo') || errMsg.includes('dns')) {
      userError = 'لا يمكن الوصول إلى المصدر — تأكد من صحة الرابط';
    } else if (errMsg.includes('econnrefused')) {
      userError = 'تم رفض الاتصال — المصدر لا يستجيب أو الرابط خطأ';
    } else if (errMsg.includes('timeout') || errMsg.includes('aborted') || errMsg.includes('مهلة')) {
      userError = 'انتهت مهلة الاتصال بالمصدر — جرّب مرة أخرى';
    } else if (errMsg.includes('certificate') || errMsg.includes('ssl') || errMsg.includes('tls')) {
      userError = 'مشكلة في شهادة SSL للمصدر';
    } else if (error.name === 'DhruFusionError') {
      userError = `خطأ من المصدر: ${error.message}`;
    } else if (error.name === 'ImeiCheckError') {
      userError = `خطأ من IMEI Check: ${error.message}`;
    }
    try {
      const { site_key } = req.user;
      const { id } = req.params;
      await Source.updateConnectionStatus(id, site_key, {
        ok: false,
        checkedAt,
        error: error.message
      });
    } catch {
      // ignore
    }
    return res.status(500).json({ success: false, connectionOk: false, error: userError });
  }
}

async function applyProfitToSourceProducts(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { profitPercentage, profitAmount } = req.body;

    const source = await Source.findById(id);
    if (!source || source.site_key !== site_key) {
      return res.status(404).json({ error: 'المصدر غير موجود' });
    }

    // دعم الربح الثابت (مبلغ) أو النسبة المئوية
    const newProfitPct = profitPercentage == null || profitPercentage === '' ? 0 : Number(profitPercentage);
    const newProfitAmt = profitAmount == null || profitAmount === '' ? null : Number(profitAmount);

    if (Number.isNaN(newProfitPct) || newProfitPct < 0) {
      return res.status(400).json({ error: 'profitPercentage غير صالح' });
    }

    // Update source profit settings
    await Source.update(id, site_key, { profitPercentage: newProfitPct, profitAmount: newProfitAmt });

    const { getPool } = require('../config/db');
    const pool = getPool();

    if (newProfitAmt !== null && newProfitAmt > 0) {
      // ربح ثابت: final_price = source_price + profitAmount
      await pool.query(
        `UPDATE products
         SET
           final_price = ROUND(source_price + ?, 3),
           price = IF(is_custom_price = 1, price, ROUND(source_price + ?, 3)),
           profit_percentage_applied = ?
         WHERE site_key = ? AND source_id = ? AND source_price IS NOT NULL`,
        [newProfitAmt, newProfitAmt, newProfitPct, site_key, id]
      );
    } else {
      // ربح بالنسبة المئوية: final_price = source_price * (1 + pct/100)
      await pool.query(
        `UPDATE products
         SET
           final_price = ROUND(source_price * (1 + (? / 100)), 3),
           price = IF(is_custom_price = 1, price, ROUND(source_price * (1 + (? / 100)), 3)),
           profit_percentage_applied = ?
         WHERE site_key = ? AND source_id = ? AND source_price IS NOT NULL`,
        [newProfitPct, newProfitPct, newProfitPct, site_key, id]
      );
    }

    const productsCount = await Product.countBySource(site_key, id);
    invalidatePublicProductsCache(site_key);
    return res.json({ success: true, productsCount, profitPercentage: newProfitPct, profitAmount: newProfitAmt });
  } catch (error) {
    console.error('Error in applyProfitToSourceProducts:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تطبيق الربح' });
  }
}

// مزامنة منتجات مصدر (Reseller API)
// Response shape expected by Dashboard:
// { success: true, count, logs: [], account: {email,credits,currency} }
async function syncSourceProducts(req, res) {
  const logs = [];
  try {
    const { site_key, id: user_id } = req.user;
    const { id } = req.params;

    const source = await Source.findById(id);
    if (!source || source.site_key !== site_key) {
      return res.status(404).json({ error: 'المصدر غير موجود' });
    }

    // استخراج خيارات المزامنة من الطلب
    const {
      setupIMEI = false,
      setupServer = false,
      setupRemote = false,
      deleteAllBrandModel = false,
      publishFrontend = false,
      syncMode = 'sync'
    } = req.body || {};

    logs.push(`Sync Mode: ${syncMode}`);
    logs.push(`Setup Options: IMEI=${setupIMEI}, Server=${setupServer}, Remote=${setupRemote}`);
    logs.push(`Delete Old: ${deleteAllBrandModel}, Publish: ${publishFrontend}`);

    const baseUrl = req.body?.apiUrl || req.body?.url || source.url;
    const apiKeyPlain = req.body?.apiKey || req.body?.api_key || decryptApiKey(source.api_key) || null;
    const username = req.body?.username || source.username || null;
    const profitPercentage = source.profit_percentage == null ? 0 : Number(source.profit_percentage);

    // ─── IMEI Check: مزامنة خاصة ───
    if (source.type === 'imeicheck') {
      logs.push('Source type: IMEI Check (alpha.imeicheck.com)');

      // 1) Balance check
      logs.push('Api action.....balance');
      let balanceInfo;
      try {
        const client = new ImeiCheckClient({ apiKey: apiKeyPlain, baseUrl });
        balanceInfo = await client.getBalance();
        logs.push(`✓ Balance: ${balanceInfo.balance} ${balanceInfo.currency}`);
      } catch (err) {
        logs.push(`✗ Balance check failed: ${err.message}`);
        await Source.updateConnectionStatus(source.id, site_key, {
          ok: false, checkedAt: new Date(), error: err.message,
        });
        return res.status(400).json({ error: `فشل الاتصال: ${err.message}`, logs });
      }

      // 2) Fetch services
      logs.push('Api action.....services');
      let servicesData;
      try {
        const client = new ImeiCheckClient({ apiKey: apiKeyPlain, baseUrl });
        servicesData = await client.getServices();
        logs.push(`✓ Found ${servicesData.totalServices} services`);
      } catch (err) {
        logs.push(`✗ Services fetch failed: ${err.message}`);
        return res.status(400).json({
          error: `فشل جلب قائمة الخدمات: ${err.message}`, logs,
          account: { credits: balanceInfo.balance, currency: balanceInfo.currency },
        });
      }

      // حذف المنتجات القديمة إذا طُلب ذلك
      if (deleteAllBrandModel || syncMode === 'delete_then_sync') {
        logs.push('Deleting old products from this source...');
        const pool = getPool();
        const [deleteResult] = await pool.query(
          'DELETE FROM products WHERE site_key = ? AND source_id = ?',
          [site_key, source.id]
        );
        logs.push(`✓ Deleted ${deleteResult.affectedRows} old products`);
      }

      logs.push('Updating services list');

      let count = 0;
      const profitAmt = source.profit_amount != null ? Number(source.profit_amount) : null;

      // Group services by their group field
      const groupMap = {};
      for (const svc of servicesData.services) {
        const g = svc.group || 'General';
        if (!groupMap[g]) groupMap[g] = [];
        groupMap[g].push(svc);
      }

      for (const [groupName, services] of Object.entries(groupMap)) {
        logs.push(`Group :: ${groupName}`);
        for (const svc of services) {
          logs.push(`Tool :: ${svc.name}`);

          const sourcePrice = svc.price;
          let finalPrice;
          if (sourcePrice == null) {
            finalPrice = null;
          } else if (profitAmt && profitAmt > 0) {
            finalPrice = Number((sourcePrice + profitAmt).toFixed(3));
          } else {
            finalPrice = Number((sourcePrice * (1 + (profitPercentage / 100))).toFixed(3));
          }

          await Product.upsertExternalService({
            site_key,
            source_id: source.id,
            user_id,
            external_service_key: String(svc.id),
            external_service_id: svc.id,
            group_name: groupName,
            group_type: null,
            service_type: svc.type || 'IMEI',
            name: svc.name,
            price: finalPrice ?? svc.price,
            credit: svc.price,
            credit_raw: svc.price == null ? null : String(svc.price),
            source_price: sourcePrice,
            final_price: finalPrice,
            profit_percentage_applied: profitPercentage,
            service_time: svc.time ?? null,
            service_info: svc.info ?? null,
            minqnt: null,
            maxqnt: null,
            qnt: null,
            server_flag: null,
            custom_json: null,
            requires_custom_json: null,
            raw_json: svc.raw ?? null,
            description: svc.info || `المجموعة: ${groupName}`,
          });

          count++;
        }
      }

      logs.push('✓ Successfully synchronize');

      await Source.updateConnectionStatus(source.id, site_key, {
        ok: true, checkedAt: new Date(), error: null,
        balance: balanceInfo.balance, currency: balanceInfo.currency,
      });

      invalidatePublicProductsCache(site_key);

      return res.json({
        success: true,
        count,
        skipped: 0,
        publishFrontend,
        setupOptions: { setupIMEI, setupServer, setupRemote },
        deleteAllBrandModel,
        logs,
        account: {
          credits: balanceInfo.balance,
          creditraw: balanceInfo.balance,
          currency: balanceInfo.currency,
        },
      });
    }

    // ─── DHRU FUSION: المزامنة الأصلية ───
    logs.push('Black List domain check.....');
    let parsedUrl;
    try {
      parsedUrl = new URL(baseUrl);
    } catch {
      return res.status(400).json({ error: 'رابط المصدر غير صالح', logs });
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      logs.push('FAILED (protocol)');
      return res.status(400).json({ error: 'protocol غير مدعوم (http/https فقط)', logs });
    }
    if (isPrivateOrLocalHostname(parsedUrl.hostname)) {
      logs.push('FAILED (private/local host)');
      return res.status(400).json({ error: 'هذا الرابط غير مسموح لأسباب أمنية', logs });
    }
    logs.push('OK');

    logs.push(`Connecting to.....${parsedUrl.origin}/`);

    // 1) accountinfo
    logs.push('Api action.....accountinfo');
    const accountResponse = await postResellerAction({
      baseUrl,
      apiKey: apiKeyPlain,
      action: 'accountinfo',
      extraBody: username ? { username } : undefined
    });
    if (!accountResponse.ok) {
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt: new Date(),
        error: `${accountResponse.status} ${accountResponse.statusText}`
      });
      return res.status(400).json({
        error: `فشل accountinfo: ${accountResponse.status} ${accountResponse.statusText}`,
        logs
      });
    }
    const accountRaw = await accountResponse.json();
    logs.push('Validate response data.....OK');
    const account = parseAccountInfo(accountRaw);

    // 2) imeiservicelist
    logs.push('Api action.....imeiservicelist');
    const listResponse = await postResellerAction({
      baseUrl,
      apiKey: apiKeyPlain,
      action: 'imeiservicelist',
      extraBody: username ? { username } : undefined
    });
    if (!listResponse.ok) {
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt: new Date(),
        error: `${listResponse.status} ${listResponse.statusText}`
      });
      return res.status(400).json({
        error: `فشل imeiservicelist: ${listResponse.status} ${listResponse.statusText}`,
        logs,
        account
      });
    }
    const listRaw = await listResponse.json();
    const groups = extractGroupsList(listRaw);
    if (!groups) {
      await Source.updateConnectionStatus(source.id, site_key, {
        ok: false,
        checkedAt: new Date(),
        error: 'Unexpected response format'
      });
      return res.status(400).json({
        error: 'تنسيق imeiservicelist غير متوقع (LIST غير موجود)',
        logs,
        account
      });
    }

    // حذف المنتجات القديمة إذا طُلب ذلك
    if (deleteAllBrandModel || syncMode === 'delete_then_sync') {
      logs.push('Deleting old products from this source...');
      const pool = getPool();
      const [deleteResult] = await pool.query(
        'DELETE FROM products WHERE site_key = ? AND source_id = ?',
        [site_key, source.id]
      );
      logs.push(`✓ Deleted ${deleteResult.affectedRows} old products`);
    }

    logs.push('Updating services list');

    let count = 0;
    let skipped = 0;
    for (const [groupKey, group] of Object.entries(groups)) {
      const groupName = group?.GROUPNAME || groupKey;
      const groupType = group?.GROUPTYPE || null;
      logs.push(`Group :: ${groupName}`);

      const services = group?.SERVICES;
      if (!services || typeof services !== 'object') continue;

      for (const [serviceKey, service] of Object.entries(services)) {
        const serviceName = service?.SERVICENAME || service?.name || null;
        const serviceType = service?.SERVICETYPE || groupType || 'SERVER';
        
        // تصفية المنتجات حسب Setup Options
        const shouldInclude = checkSetupFilter(serviceType, setupIMEI, setupServer, setupRemote);
        if (!shouldInclude) {
          skipped++;
          continue;
        }
        
        logs.push(`Tool :: ${serviceName || serviceKey}`);

        const creditRaw = service?.CREDIT ?? service?.credit ?? null;
        const creditNum = creditRaw == null || creditRaw === '' ? null : Number.parseFloat(String(creditRaw));

        const descriptionParts = [];
        if (groupName) descriptionParts.push(`المجموعة: ${groupName}`);
        if (service?.TIME) descriptionParts.push(`المدة: ${String(service.TIME).trim()}`);
        if (service?.INFO) descriptionParts.push(String(service.INFO).trim());

        const sourcePrice = creditNum;
        const appliedProfit = profitPercentage;
        const profitAmt = source.profit_amount != null ? Number(source.profit_amount) : null;
        let finalPrice;
        if (sourcePrice == null) {
          finalPrice = null;
        } else if (profitAmt && profitAmt > 0) {
          // ربح ثابت: source_price + profit_amount
          finalPrice = Number((sourcePrice + profitAmt).toFixed(3));
        } else {
          // ربح بالنسبة المئوية
          finalPrice = Number((sourcePrice * (1 + (appliedProfit / 100))).toFixed(3));
        }

        await Product.upsertExternalService({
          site_key,
          source_id: source.id,
          user_id,
          external_service_key: serviceKey,
          external_service_id: service?.SERVICEID ?? null,
          group_name: groupName ?? null,
          group_type: groupType ?? null,
          service_type: serviceType,
          name: serviceName,
          // Price shown to dashboard is the FINAL price
          price: finalPrice ?? creditNum,
          credit: creditNum,
          credit_raw: creditRaw == null ? null : String(creditRaw),
          source_price: sourcePrice,
          final_price: finalPrice,
          profit_percentage_applied: appliedProfit,
          service_time: service?.TIME ?? null,
          service_info: service?.INFO ?? null,
          minqnt: service?.MINQNT ?? null,
          maxqnt: service?.MAXQNT ?? null,
          qnt: service?.QNT ?? null,
          server_flag: service?.SERVER ?? null,
          custom_json: service?.CUSTOM ?? null,
          requires_custom_json: service?.['Requires.Custom'] ?? null,
          raw_json: service ?? null,
          description: descriptionParts.filter(Boolean).join('\n') || null
        });

        count++;
      }
    }

    logs.push('✓ Successfully synchronize');
    if (skipped > 0) {
      logs.push(`→ Skipped ${skipped} products (not matching setup filters)`);
    }

    await Source.updateConnectionStatus(source.id, site_key, {
      ok: true,
      checkedAt: new Date(),
      error: null,
      balance: account.creditraw || account.credits || null,
      currency: account.currency || null
    });

    // حذف كاش المنتجات العامة فوراً بعد المزامنة
    invalidatePublicProductsCache(site_key);

    return res.json({
      success: true,
      count,
      skipped,
      publishFrontend,
      setupOptions: {
        setupIMEI,
        setupServer,
        setupRemote
      },
      deleteAllBrandModel,
      logs,
      account
    });
  } catch (error) {
    console.error('Error in syncSourceProducts:', error);
    logs.push(`✗ Error: ${error.message}`);
    try {
      const { site_key } = req.user;
      const { id } = req.params;
      await Source.updateConnectionStatus(id, site_key, {
        ok: false,
        checkedAt: new Date(),
        error: error.message
      });
    } catch {
      // ignore
    }
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء مزامنة المصدر',
      logs
    });
  }
}

// ─── تبديل وضع المزامنة فقط ───
async function toggleSyncOnly(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { syncOnly } = req.body;

    const pool = getPool();
    const syncOnlyVal = syncOnly ? 1 : 0;

    const [result] = await pool.query(
      'UPDATE sources SET sync_only = ? WHERE id = ? AND site_key = ?',
      [syncOnlyVal, id, site_key]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'المصدر غير موجود' });
    }

    res.json({
      success: true,
      message: syncOnlyVal
        ? 'تم تفعيل وضع المزامنة فقط - المنتجات لن تظهر للزبائن'
        : 'تم تفعيل وضع المزامنة والتثبيت - المنتجات ستظهر للزبائن',
      syncOnly: Boolean(syncOnlyVal)
    });
  } catch (error) {
    console.error('Error in toggleSyncOnly:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث وضع المزامنة' });
  }
}

module.exports = {
  getAllSources,
  createSource,
  updateSource,
  deleteSource,
  syncSourceProducts,
  testSourceConnection,
  getSourceStats,
  applyProfitToSourceProducts,
  toggleSyncOnly
};
