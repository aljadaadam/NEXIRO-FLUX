const { DeliveryZone, DeliveryRegion } = require('../models/DeliveryZone');

// ─── مناطق التوصيل ───

// جلب جميع مناطق التوصيل
async function getDeliveryZones(req, res) {
  try {
    const { site_key } = req.user;
    const zones = await DeliveryZone.findBySiteKey(site_key);
    res.json({ zones });
  } catch (error) {
    console.error('Error in getDeliveryZones:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب مناطق التوصيل' });
  }
}

// إنشاء منطقة توصيل
async function createDeliveryZone(req, res) {
  try {
    const { site_key } = req.user;
    const { country_name, country_code, is_active } = req.body;
    if (!country_name) {
      return res.status(400).json({ error: 'اسم الدولة مطلوب' });
    }
    const zone = await DeliveryZone.create(site_key, { country_name, country_code, is_active });
    res.status(201).json({ message: 'تم إنشاء منطقة التوصيل', zone });
  } catch (error) {
    console.error('Error in createDeliveryZone:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء منطقة التوصيل' });
  }
}

// تحديث منطقة توصيل
async function updateDeliveryZone(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const zone = await DeliveryZone.update(id, site_key, req.body);
    if (!zone) {
      return res.status(404).json({ error: 'المنطقة غير موجودة' });
    }
    res.json({ message: 'تم تحديث منطقة التوصيل', zone });
  } catch (error) {
    console.error('Error in updateDeliveryZone:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث منطقة التوصيل' });
  }
}

// حذف منطقة توصيل
async function deleteDeliveryZone(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const deleted = await DeliveryZone.delete(id, site_key);
    if (!deleted) {
      return res.status(404).json({ error: 'المنطقة غير موجودة' });
    }
    res.json({ message: 'تم حذف منطقة التوصيل' });
  } catch (error) {
    console.error('Error in deleteDeliveryZone:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف منطقة التوصيل' });
  }
}

// ─── المناطق الفرعية (المدن/المحافظات) ───

// إنشاء منطقة فرعية
async function createDeliveryRegion(req, res) {
  try {
    const { site_key } = req.user;
    const { zone_id, name, shipping_cost, estimated_days, is_active } = req.body;
    if (!zone_id || !name) {
      return res.status(400).json({ error: 'المنطقة واسم المدينة مطلوبان' });
    }
    const region = await DeliveryRegion.create(site_key, { zone_id, name, shipping_cost, estimated_days, is_active });
    res.status(201).json({ message: 'تم إنشاء المنطقة الفرعية', region });
  } catch (error) {
    console.error('Error in createDeliveryRegion:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المنطقة الفرعية' });
  }
}

// تحديث منطقة فرعية
async function updateDeliveryRegion(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const region = await DeliveryRegion.update(id, site_key, req.body);
    if (!region) {
      return res.status(404).json({ error: 'المنطقة الفرعية غير موجودة' });
    }
    res.json({ message: 'تم تحديث المنطقة الفرعية', region });
  } catch (error) {
    console.error('Error in updateDeliveryRegion:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث المنطقة الفرعية' });
  }
}

// حذف منطقة فرعية
async function deleteDeliveryRegion(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const deleted = await DeliveryRegion.delete(id, site_key);
    if (!deleted) {
      return res.status(404).json({ error: 'المنطقة الفرعية غير موجودة' });
    }
    res.json({ message: 'تم حذف المنطقة الفرعية' });
  } catch (error) {
    console.error('Error in deleteDeliveryRegion:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المنطقة الفرعية' });
  }
}

module.exports = {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  createDeliveryRegion,
  updateDeliveryRegion,
  deleteDeliveryRegion
};
