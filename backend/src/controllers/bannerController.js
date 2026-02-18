const Banner = require('../models/Banner');

// جلب جميع البانرات (أدمن)
async function getBanners(req, res) {
  try {
    const { site_key } = req.user;
    const banners = await Banner.findBySiteKey(site_key);
    res.json({ banners });
  } catch (error) {
    console.error('Error in getBanners:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب البانرات' });
  }
}

// جلب البانرات النشطة (للمتجر — بدون مصادقة)
async function getActiveBanners(req, res) {
  try {
    const siteKey = req.siteKey;
    if (!siteKey) {
      return res.status(400).json({ error: 'لم يتم تحديد الموقع' });
    }
    const banners = await Banner.findActiveBySiteKey(siteKey);
    res.json({ banners });
  } catch (error) {
    console.error('Error in getActiveBanners:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب البانرات' });
  }
}

// إنشاء بانر
async function createBanner(req, res) {
  try {
    const { site_key } = req.user;
    const banner = await Banner.create(site_key, req.body);
    res.status(201).json({ message: 'تم إنشاء البانر', banner });
  } catch (error) {
    console.error('Error in createBanner:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء البانر' });
  }
}

// تحديث بانر
async function updateBanner(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const banner = await Banner.update(id, site_key, req.body);
    if (!banner) {
      return res.status(404).json({ error: 'البانر غير موجود' });
    }
    res.json({ message: 'تم تحديث البانر', banner });
  } catch (error) {
    console.error('Error in updateBanner:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث البانر' });
  }
}

// حذف بانر
async function deleteBanner(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const deleted = await Banner.delete(id, site_key);
    if (!deleted) {
      return res.status(404).json({ error: 'البانر غير موجود' });
    }
    res.json({ message: 'تم حذف البانر' });
  } catch (error) {
    console.error('Error in deleteBanner:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف البانر' });
  }
}

module.exports = {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
