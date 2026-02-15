/**
 * ─── Tenant Resolution Middleware ───
 * Resolves site_key dynamically from the request.
 * 
 * Resolution order:
 *   1. X-Site-Key header (store frontends send this)
 *   2. Host header → lookup by domain/custom_domain
 *   3. SITE_KEY from env (fallback for platform admin / development)
 * 
 * Sets: req.siteKey, req.site
 */
const Site = require('../models/Site');
const { SITE_KEY } = require('../config/env');

// Cache domains → site_key for performance (TTL: 5 min)
const domainCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(domain) {
  const entry = domainCache.get(domain);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    domainCache.delete(domain);
    return null;
  }
  return entry.site;
}

function setCache(domain, site) {
  domainCache.set(domain, { site, ts: Date.now() });
}

// Domains that belong to the platform itself (not a tenant)
const PLATFORM_HOSTS = [
  'localhost',
  '127.0.0.1',
  'nexiroflux.com',
  'www.nexiroflux.com',
  'api.nexiroflux.com',
  'nexiro-flux.com',
  'www.nexiro-flux.com',
];

function isPlatformHost(host) {
  const hostname = host.split(':')[0].toLowerCase();
  return PLATFORM_HOSTS.includes(hostname);
}

async function resolveTenant(req, res, next) {
  try {
    // ─── 1. X-Site-Key header (highest priority) ───
    const headerSiteKey = req.headers['x-site-key'];
    if (headerSiteKey && headerSiteKey !== 'undefined') {
      const site = await Site.findBySiteKey(headerSiteKey);
      if (site) {
        req.siteKey = site.site_key;
        req.site = site;
        return next();
      }
      // Invalid site key — continue to other methods
    }

    // ─── 2. Host header → domain lookup ───
    const host = (req.headers.host || '').split(':')[0].toLowerCase();

    if (host && !isPlatformHost(req.headers.host || '')) {
      // Check cache first
      const cached = getCached(host);
      if (cached) {
        req.siteKey = cached.site_key;
        req.site = cached;
        return next();
      }

      // Check if it's a subdomain of nexiroflux.com (e.g., mystore.nexiroflux.com)
      let site = await Site.findByDomain(host);

      // Also check custom_domain
      if (!site) {
        site = await Site.findByCustomDomain(host);
      }

      if (site) {
        setCache(host, site);
        req.siteKey = site.site_key;
        req.site = site;
        return next();
      }
    }

    // ─── 3. Fallback to ENV SITE_KEY ───
    // Always use ENV SITE_KEY as last resort (needed for setup checkout & payment gateways)
    if (SITE_KEY) {
      const site = await Site.findBySiteKey(SITE_KEY);
      req.siteKey = SITE_KEY;
      req.site = site || null;
      return next();
    }

    // No tenant resolved — still continue (some routes don't need it e.g., /api/setup/provision)
    req.siteKey = null;
    req.site = null;
    next();

  } catch (error) {
    console.error('Tenant resolution error:', error.message);
    // Don't block the request, just continue without tenant
    req.siteKey = null;
    req.site = null;
    next();
  }
}

// Clear cache for a specific domain (call after domain changes)
function clearDomainCache(domain) {
  if (domain) domainCache.delete(domain.toLowerCase());
}

function clearAllCache() {
  domainCache.clear();
}

module.exports = {
  resolveTenant,
  clearDomainCache,
  clearAllCache,
};
