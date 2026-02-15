const { SITE_KEY } = require('../config/env');
const Site = require('../models/Site');

async function validateSite(req, res, next) {
  try {
    // If resolveTenant already resolved the site, use it
    if (req.site && req.siteKey) {
      return next();
    }

    // Try resolving from siteKey (set by resolveTenant or auth)
    const siteKey = req.siteKey || req.user?.site_key || SITE_KEY;

    if (!siteKey || siteKey === 'default-site-key') {
      return res.status(500).json({ 
        error: 'لم يتم تحديد الموقع. تأكد من إرسال X-Site-Key header أو تهيئة SITE_KEY' 
      });
    }

    const site = await Site.findBySiteKey(siteKey);
    
    if (!site) {
      return res.status(403).json({ 
        error: 'الموقع غير مسجل في النظام' 
      });
    }

    req.site = site;
    req.siteKey = site.site_key;
    next();
    
  } catch (error) {
    console.error('Error in validateSite:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق من الموقع' });
  }
}

module.exports = {
  validateSite
};