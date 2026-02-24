/**
 * ─── Product Service ───
 * Business logic extracted from productController.js.
 * Handles product data transformation, price normalization,
 * external API parsing, and statistics computation.
 */

// ─── In-memory Cache (per site_key) ───
const _publicProductsCache = new Map();
const CACHE_TTL = 30_000; // 30 seconds

function getCachedPublicProducts(siteKey) {
  const entry = _publicProductsCache.get(siteKey);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    _publicProductsCache.delete(siteKey);
    return null;
  }
  return entry.data;
}

function setCachedPublicProducts(siteKey, data) {
  _publicProductsCache.set(siteKey, { data, ts: Date.now() });
}

function invalidatePublicProductsCache(siteKey) {
  if (siteKey) {
    _publicProductsCache.delete(siteKey);
  } else {
    _publicProductsCache.clear();
  }
}

// ─── Price Normalization ───
/**
 * Normalize a raw price value — handles strings with `$`, `,`, spaces.
 * @param {*} raw 
 * @returns {number} NaN if invalid
 */
function normalizePrice(raw) {
  return Number.parseFloat(String(raw ?? '').replace(/[$,\s]/g, ''));
}

// ─── Boolean Coercion ───
/**
 * Convert various truthy string representations to 0/1.
 * @param {*} value 
 * @returns {number} 1 or 0
 */
function toBooleanInt(value) {
  if (value === undefined) return 0;
  return ['1', 'true', 'on', 'yes'].includes(String(value).toLowerCase()) ? 1 : 0;
}

// ─── JSON Field Parsing ───
/**
 * Safely parse a JSON field that may be a string or already an object.
 * @param {*} value 
 * @param {string} fieldName - for logging
 * @param {number} productId - for logging
 * @returns {*} parsed object or null
 */
function safeParseJson(value, fieldName = '', productId = null) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    if (productId) {
      console.error(`Error parsing ${fieldName} for product ${productId}:`, e);
    }
    return null;
  }
}

/**
 * Transform a raw product row for dashboard API response.
 * Parses JSON fields and adds computed properties.
 */
function transformProductForDashboard(p) {
  const customJson = safeParseJson(p.custom_json, 'custom_json', p.id);
  const requiresCustomJson = safeParseJson(p.requires_custom_json, 'requires_custom_json', p.id);
  const rawJson = safeParseJson(p.raw_json, 'raw_json', p.id);

  return {
    ...p,
    customPrice: p.is_custom_price === 1 ? p.price : null,
    custom_json: customJson,
    requires_custom_json: requiresCustomJson,
    raw_json: rawJson,
    customFields: requiresCustomJson || [],
    source: p.source_id ? {
      id: p.source_id,
      name: p.source_name,
      url: p.source_url
    } : null
  };
}

// ─── External API Response Parsing ───
/**
 * Extract an array of products from various external API response formats.
 * Supports: plain arrays, { products }, { data }, { services }, DHRU SERVICELIST,
 * and fallback Object.values.
 */
function extractProductsFromApiResponse(externalData) {
  if (Array.isArray(externalData)) {
    return externalData;
  }
  if (externalData.products) return externalData.products;
  if (externalData.data) return externalData.data;
  if (externalData.services) return externalData.services;
  if (externalData.SERVICELIST && Array.isArray(externalData.SERVICELIST)) {
    const processed = [];
    for (const group of externalData.SERVICELIST) {
      if (group.GROUPNAME && group.SERVICES) {
        for (const serviceId in group.SERVICES) {
          const service = group.SERVICES[serviceId];
          processed.push({
            ...service,
            GROUPNAME: group.GROUPNAME,
            GROUPTYPE: group.GROUPTYPE,
            _group: group.GROUPNAME,
          });
        }
      }
    }
    return processed;
  }
  // Fallback — find first array in values
  return Object.values(externalData).find(val => Array.isArray(val)) || [];
}

/**
 * Normalize a single external product from various API formats into a
 * standard shape { name, price, description, service_type, group }.
 */
function normalizeExternalProduct(extProduct) {
  const group = extProduct._group ||
    extProduct.GROUPNAME ||
    extProduct.groupName ||
    extProduct.group ||
    'General';

  const name = extProduct.name ||
    extProduct.SERVICENAME ||
    extProduct.servicename ||
    extProduct.title ||
    extProduct.product_name;

  const price = extProduct.price ||
    extProduct.CREDIT ||
    extProduct.credit ||
    extProduct.cost ||
    extProduct.amount;

  const description = extProduct.description ||
    extProduct.INFO ||
    extProduct.info ||
    extProduct.desc || '';

  const service_type = extProduct.service_type ||
    extProduct.SERVICETYPE ||
    extProduct.GROUPTYPE ||
    'SERVER';

  return { name, price, description, service_type, group };
}

// ─── Statistics ───
/**
 * Compute summary statistics from a products array.
 */
function computeStats(products) {
  const prices = products.map(p => parseFloat(p.price || 0));
  const total = prices.length;
  const totalValue = prices.reduce((s, v) => s + v, 0);

  return {
    total,
    totalValue,
    averagePrice: total > 0 ? totalValue / total : 0,
    highestPrice: total > 0 ? Math.max(...prices) : 0,
    lowestPrice: total > 0 ? Math.min(...prices) : 0,
  };
}

// ─── Stock Normalization ───
/**
 * Normalize stock/qnt value.
 */
function normalizeStock(value) {
  if (value === undefined || value === null || value === '') return null;
  return String(value);
}

module.exports = {
  // Cache
  getCachedPublicProducts,
  setCachedPublicProducts,
  invalidatePublicProductsCache,
  // Price & coercion
  normalizePrice,
  toBooleanInt,
  normalizeStock,
  // JSON
  safeParseJson,
  transformProductForDashboard,
  // External API
  extractProductsFromApiResponse,
  normalizeExternalProduct,
  // Stats
  computeStats,
};
