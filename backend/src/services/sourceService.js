/**
 * ─── Source Service ───
 * Business logic extracted from sourceController.js.
 * Handles DHRU error translation, source response formatting,
 * URL validation, profit calculations, and reusable helpers.
 */

// ─── DHRU Error Translation ───
/**
 * Translate common DHRU Fusion API error messages to Arabic.
 * Used in createSource, testSourceConnection, and syncSourceProducts.
 * @param {string} errMsg - Error message from API
 * @param {string} [fullDescription] - Extended error description
 * @returns {string} Arabic error message
 */
function translateDhruError(errMsg, fullDescription = '') {
  const msg = String(errMsg || '').toLowerCase();
  const desc = String(fullDescription || '').toLowerCase();

  if (msg.includes('invalid api key') || msg.includes('invalid username') || desc.includes('invalid api key')) {
    return 'مفتاح API أو اسم المستخدم غير صحيح — تأكد من البيانات';
  }
  if (msg.includes('access denied') || msg.includes('permission denied')) {
    return 'الوصول مرفوض — تأكد من صلاحيات API Key';
  }
  if (msg.includes('account suspended') || msg.includes('account blocked')) {
    return 'الحساب معلق أو محظور في المصدر';
  }
  if (msg.includes('ip not allowed') || msg.includes('ip whitelist')) {
    return 'عنوان IP السيرفر غير مسموح — أضف IP السيرفر في لوحة المصدر';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'تم تجاوز الحد المسموح من الطلبات — حاول لاحقاً';
  }
  if (msg.includes('not found') || msg.includes('404')) {
    return 'الخدمة غير موجودة في المصدر';
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'انتهت مهلة الاتصال — المصدر بطيء أو غير متاح';
  }

  return errMsg || 'خطأ غير معروف من المصدر';
}

// ─── Source Response Formatting ───
/**
 * Build a standardized source object for API responses.
 * Masks API keys and includes connection status info.
 * @param {object} source - Raw source database row
 * @param {number} [productsCount=0] - Number of products from this source
 * @returns {object} Formatted source response
 */
function formatSourceResponse(source, productsCount = 0) {
  const apiKeyLast4 = source.api_key_last4 || (source.api_key ? source.api_key.slice(-4) : null);

  return {
    id: source.id,
    name: source.name,
    type: source.type,
    url: source.url,
    username: source.username,
    apiKeyLast4,
    apiKeyMasked: apiKeyLast4 ? `****${apiKeyLast4}` : null,
    profitPercentage: parseFloat(source.profit_percentage || 0),
    profitAmount: source.profit_amount ? parseFloat(source.profit_amount) : null,
    syncOnly: source.sync_only || 0,
    description: source.description,
    productsCount,
    connectionStatus: {
      ok: source.last_connection_ok,
      checkedAt: source.last_connection_checked_at,
      error: source.last_connection_error,
      balance: source.last_account_balance,
      currency: source.last_account_currency,
    },
    createdAt: source.created_at,
  };
}

// ─── URL Validation ───
/**
 * Validate a source URL — checks protocol and blocks private/local hosts.
 * @param {string} url 
 * @returns {{ parsed: URL|null, error: string|null }}
 */
function validateSourceUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { parsed: null, error: 'البروتوكول يجب أن يكون http أو https' };
    }
    if (isPrivateOrLocalHostname(parsed.hostname)) {
      return { parsed: null, error: 'لا يمكن الاتصال بعنوان محلي أو خاص (SSRF protection)' };
    }
    return { parsed, error: null };
  } catch (e) {
    return { parsed: null, error: 'عنوان URL غير صالح' };
  }
}

/**
 * Check if a hostname is private or localhost (SSRF protection).
 */
function isPrivateOrLocalHostname(hostname) {
  if (!hostname) return true;
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true;
  if (h.endsWith('.local') || h.endsWith('.internal')) return true;
  // Private IP ranges
  if (/^10\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  return false;
}

// ─── Profit Calculation ───
/**
 * Calculate the final price based on source price and profit settings.
 * Supports both percentage-based and fixed-amount profit.
 * @param {number} sourcePrice - Original price from source
 * @param {number} profitPercentage - Profit percentage (0-100+)
 * @param {number|null} profitAmount - Fixed profit amount in USD
 * @returns {number} Final price with profit applied
 */
function calculatePriceWithProfit(sourcePrice, profitPercentage = 0, profitAmount = null) {
  let finalPrice = parseFloat(sourcePrice);
  
  if (profitAmount && parseFloat(profitAmount) > 0) {
    // Fixed amount profit
    finalPrice += parseFloat(profitAmount);
  } else if (profitPercentage > 0) {
    // Percentage profit
    finalPrice += finalPrice * (profitPercentage / 100);
  }
  
  return Math.round(finalPrice * 1000) / 1000; // Round to 3 decimals
}

module.exports = {
  translateDhruError,
  formatSourceResponse,
  validateSourceUrl,
  isPrivateOrLocalHostname,
  calculatePriceWithProfit,
};
