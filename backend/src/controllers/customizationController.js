const Customization = require('../models/Customization');

// جلب تخصيصات الموقع
async function getCustomization(req, res) {
  try {
    const { site_key } = req.user;
    const customization = await Customization.findBySiteKey(site_key);

    res.json({
      customization: customization || {
        theme_id: 'purple',
        primary_color: '#7c5cff',
        secondary_color: '#a78bfa',
        dark_mode: true,
        button_radius: 'rounded-xl',
        header_style: 'default',
        show_banner: true,
        font_family: 'Tajawal'
      }
    });
  } catch (error) {
    console.error('Error in getCustomization:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// تحديث تخصيصات الموقع
async function updateCustomization(req, res) {
  try {
    const { site_key } = req.user;
    const customization = await Customization.upsert(site_key, req.body);

    res.json({ message: 'تم تحديث التخصيصات', customization });
  } catch (error) {
    console.error('Error in updateCustomization:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث التخصيصات' });
  }
}

// إعادة الإعدادات الافتراضية
async function resetCustomization(req, res) {
  try {
    const { site_key } = req.user;
    await Customization.reset(site_key);

    res.json({ message: 'تمت إعادة الإعدادات الافتراضية' });
  } catch (error) {
    console.error('Error in resetCustomization:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// جلب التخصيصات العامة (بدون مصادقة - للواجهة الأمامية للمتجر)
async function getPublicCustomization(req, res) {
  try {
    const { site_key } = req.params;
    if (!site_key) {
      return res.status(400).json({ error: 'site_key مطلوب' });
    }

    const customization = await Customization.findBySiteKey(site_key);

    // Strip admin_slug from public response
    if (customization) {
      delete customization.admin_slug;
    }

    res.json({
      customization: customization || {
        theme_id: 'purple',
        primary_color: '#7c5cff',
        dark_mode: true,
        button_radius: 'rounded-xl',
        show_banner: true,
        font_family: 'Tajawal'
      }
    });
  } catch (error) {
    console.error('Error in getPublicCustomization:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// جلب التخصيصات للمتجر (بدون مصادقة — يستخدم siteKey من resolveTenant)
async function getStoreCustomization(req, res) {
  try {
    const siteKey = req.siteKey;
    if (!siteKey) {
      return res.status(400).json({ error: 'لم يتم تحديد الموقع' });
    }

    const customization = await Customization.findBySiteKey(siteKey);

    // Strip admin_slug from public response
    if (customization) {
      delete customization.admin_slug;
    }

    res.json({
      customization: customization || {
        theme_id: 'purple',
        primary_color: '#7c5cff',
        dark_mode: true,
        button_radius: 'rounded-xl',
        show_banner: true,
        font_family: 'Tajawal'
      }
    });
  } catch (error) {
    console.error('Error in getStoreCustomization:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// التحقق من صلاحية مفتاح الأدمن (admin_slug)
async function verifyAdminSlug(req, res) {
  try {
    const siteKey = req.siteKey;
    const { slug } = req.params;
    if (!siteKey || !slug) {
      return res.json({ valid: false });
    }

    const customization = await Customization.findBySiteKey(siteKey);
    const valid = customization && customization.admin_slug === slug;

    res.json({ valid: !!valid });
  } catch (error) {
    console.error('Error in verifyAdminSlug:', error);
    res.json({ valid: false });
  }
}

module.exports = {
  getCustomization,
  updateCustomization,
  resetCustomization,
  getPublicCustomization,
  getStoreCustomization,
  verifyAdminSlug
};
