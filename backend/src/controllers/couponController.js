const Coupon = require('../models/Coupon');

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll(req.siteKey);
    res.json(coupons);
  } catch (err) {
    console.error('Error getting coupons:', err);
    res.status(500).json({ error: 'فشل في جلب أكواد الخصم' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value, max_uses, min_order_amount, expires_at, is_active } = req.body;
    if (!code || !discount_value) {
      return res.status(400).json({ error: 'الكود وقيمة الخصم مطلوبان' });
    }
    if (discount_type === 'percentage' && (discount_value < 0 || discount_value > 100)) {
      return res.status(400).json({ error: 'نسبة الخصم يجب أن تكون بين 0 و 100' });
    }

    const existing = await Coupon.findByCode(req.siteKey, code);
    if (existing) {
      return res.status(400).json({ error: 'هذا الكود موجود بالفعل' });
    }

    const coupon = await Coupon.create(req.siteKey, {
      code, discount_type, discount_value, max_uses, min_order_amount, expires_at, is_active,
    });
    res.status(201).json(coupon);
  } catch (err) {
    console.error('Error creating coupon:', err);
    res.status(500).json({ error: 'فشل في إنشاء كود الخصم' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount_type, discount_value, max_uses, min_order_amount, expires_at, is_active } = req.body;

    if (discount_type === 'percentage' && discount_value !== undefined && (discount_value < 0 || discount_value > 100)) {
      return res.status(400).json({ error: 'نسبة الخصم يجب أن تكون بين 0 و 100' });
    }

    if (code) {
      const existing = await Coupon.findByCode(req.siteKey, code);
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({ error: 'هذا الكود موجود بالفعل' });
      }
    }

    await Coupon.update(req.siteKey, id, {
      code, discount_type, discount_value, max_uses, min_order_amount, expires_at, is_active,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating coupon:', err);
    res.status(500).json({ error: 'فشل في تحديث كود الخصم' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.delete(req.siteKey, id);
    if (!deleted) {
      return res.status(404).json({ error: 'كود الخصم غير موجود' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting coupon:', err);
    res.status(500).json({ error: 'فشل في حذف كود الخصم' });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, order_amount } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, error: 'الكود مطلوب' });
    }
    const result = await Coupon.validate(req.siteKey, code, order_amount || 0);
    res.json(result);
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ valid: false, error: 'فشل في التحقق من كود الخصم' });
  }
};
