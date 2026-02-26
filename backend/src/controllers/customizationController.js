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
        dark_mode: false,
        button_radius: '14',
        header_style: 'default',
        show_banner: true,
        font_family: 'Tajawal',
        store_language: 'ar',
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

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = [
      'theme_id', 'primary_color', 'secondary_color', 'dark_mode',
      'button_radius', 'header_style', 'show_banner', 'font_family',
      'store_language', 'store_name', 'store_description', 'logo_url',
      'favicon_url', 'currency', 'currency_symbol', 'currency_position',
      'whatsapp_number', 'telegram_link', 'facebook_link', 'twitter_link',
      'instagram_link', 'tiktok_link', 'youtube_link',
      'meta_title', 'meta_description', 'ga_id', 'pixel_id',
      'show_prices', 'allow_guest_checkout', 'maintenance_mode',
      'custom_css', 'announcement_bar', 'announcement_bar_text',
      'announcement_bar_color', 'announcement_bar_link',
    ];
    // Only admin can update SMTP and admin_slug
    if (req.user.role === 'admin') {
      allowedFields.push('admin_slug', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from');
    }
    const safeBody = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }

    const customization = await Customization.upsert(site_key, safeBody);

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
        dark_mode: false,
        button_radius: '14',
        show_banner: true,
        font_family: 'Tajawal',
        store_language: 'ar',
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

    // Strip sensitive fields from public response
    if (customization) {
      delete customization.admin_slug;
      delete customization.smtp_host;
      delete customization.smtp_port;
      delete customization.smtp_user;
      delete customization.smtp_pass;
      delete customization.smtp_from;

      // إذا store_name فارغ — نجلبه من جدول sites
      if (!customization.store_name && req.site && req.site.name) {
        customization.store_name = req.site.name;
      }
    }

    res.json({
      customization: customization || {
        theme_id: 'purple',
        primary_color: '#7c5cff',
        dark_mode: false,
        button_radius: '14',
        show_banner: true,
        font_family: 'Tajawal',
        store_language: 'ar',
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
