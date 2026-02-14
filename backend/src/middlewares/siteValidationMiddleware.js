const { SITE_KEY } = require('../config/env');
const Site = require('../models/Site');

async function validateSite(req, res, next) {
  try {
    // التحقق من أن SITE_KEY موجود في ملف .env
    if (!SITE_KEY || SITE_KEY === 'default-site-key') {
      return res.status(500).json({ 
        error: 'لم يتم تهيئة SITE_KEY في ملف .env' 
      });
    }

    // التحقق من وجود الموقع في قاعدة البيانات
    const site = await Site.findBySiteKey(SITE_KEY);
    
    if (!site) {
      return res.status(403).json({ 
        error: 'الموقع غير مسجل في النظام' 
      });
    }

    // إضافة معلومات الموقع إلى الـ request
    req.site = site;
    next();
    
  } catch (error) {
    console.error('Error in validateSite:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء التحقق من الموقع' });
  }
}

module.exports = {
  validateSite
};