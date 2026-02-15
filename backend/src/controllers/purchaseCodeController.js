const PurchaseCode = require('../models/PurchaseCode');
const crypto = require('crypto');

// ─── التحقق من كود الشراء (عام — بدون مصادقة) ───
async function validateCode(req, res) {
  try {
    const { code, template_id } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'يرجى إدخال كود الشراء', errorEn: 'Please enter a purchase code' });
    }

    const result = await PurchaseCode.validate(code, template_id);

    if (!result.valid) {
      return res.status(400).json({ error: result.error, errorEn: result.errorEn });
    }

    res.json({
      valid: true,
      discount_type: result.discount_type,
      discount_value: result.discount_value,
      billing_cycle: result.billing_cycle,
      template_id: result.template_id,
      message: 'الكود صالح ✅',
      messageEn: 'Code is valid ✅',
    });
  } catch (error) {
    console.error('Error validating code:', error);
    res.status(500).json({ error: 'خطأ في التحقق من الكود' });
  }
}

// ───────────────── Admin-only endpoints ─────────────────

// ─── جلب جميع الأكواد ───
async function getAllCodes(req, res) {
  try {
    const { search, is_active, template_id, limit } = req.query;
    const codes = await PurchaseCode.findAll({
      search,
      is_active: is_active !== undefined ? Number(is_active) : undefined,
      template_id,
      limit: limit ? Number(limit) : undefined,
    });
    const stats = await PurchaseCode.getStats();

    res.json({ codes, stats });
  } catch (error) {
    console.error('Error fetching codes:', error);
    res.status(500).json({ error: 'خطأ في جلب الأكواد' });
  }
}

// ─── إنشاء كود واحد ───
async function createCode(req, res) {
  try {
    const {
      code,
      template_id,
      billing_cycle,
      discount_type,
      discount_value,
      max_uses,
      expires_at,
      note,
    } = req.body;

    const finalCode = code || PurchaseCode.generateCode();

    // التحقق من عدم تكرار الكود
    const existing = await PurchaseCode.findByCode(finalCode);
    if (existing) {
      return res.status(400).json({ error: 'هذا الكود موجود بالفعل', errorEn: 'Code already exists' });
    }

    const created = await PurchaseCode.create({
      code: finalCode,
      template_id: template_id || null,
      billing_cycle: billing_cycle || 'monthly',
      discount_type: discount_type || 'full',
      discount_value: discount_value || 0,
      max_uses: max_uses !== undefined ? max_uses : 1,
      expires_at: expires_at || null,
      note: note || null,
      created_by: req.user?.email || 'system',
    });

    res.status(201).json({ message: 'تم إنشاء الكود بنجاح', code: created });
  } catch (error) {
    console.error('Error creating code:', error);
    res.status(500).json({ error: 'خطأ في إنشاء الكود' });
  }
}

// ─── إنشاء أكواد متعددة (دفعة واحدة) ───
async function createBatch(req, res) {
  try {
    const {
      count = 5,
      prefix,
      length,
      template_id,
      billing_cycle,
      discount_type,
      discount_value,
      max_uses,
      expires_at,
      note,
    } = req.body;

    if (count < 1 || count > 100) {
      return res.status(400).json({ error: 'العدد يجب أن يكون بين 1 و 100', errorEn: 'Count must be between 1 and 100' });
    }

    const codes = await PurchaseCode.generateBatch(count, {
      prefix: prefix || 'NX',
      length: length || 12,
      template_id: template_id || null,
      billing_cycle: billing_cycle || 'monthly',
      discount_type: discount_type || 'full',
      discount_value: discount_value || 0,
      max_uses: max_uses !== undefined ? max_uses : 1,
      expires_at: expires_at || null,
      note: note || null,
      created_by: req.user?.email || 'system',
    });

    res.status(201).json({
      message: `تم إنشاء ${codes.length} كود بنجاح`,
      messageEn: `${codes.length} codes created successfully`,
      codes,
    });
  } catch (error) {
    console.error('Error creating batch codes:', error);
    res.status(500).json({ error: 'خطأ في إنشاء الأكواد' });
  }
}

// ─── تحديث كود ───
async function updateCode(req, res) {
  try {
    const { id } = req.params;
    const updated = await PurchaseCode.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'الكود غير موجود' });
    }

    res.json({ message: 'تم تحديث الكود', code: updated });
  } catch (error) {
    console.error('Error updating code:', error);
    res.status(500).json({ error: 'خطأ في تحديث الكود' });
  }
}

// ─── حذف كود ───
async function deleteCode(req, res) {
  try {
    const { id } = req.params;
    await PurchaseCode.delete(id);
    res.json({ message: 'تم حذف الكود' });
  } catch (error) {
    console.error('Error deleting code:', error);
    res.status(500).json({ error: 'خطأ في حذف الكود' });
  }
}

// ─── جلب إحصائيات ───
async function getCodeStats(req, res) {
  try {
    const stats = await PurchaseCode.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching code stats:', error);
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
}

module.exports = {
  validateCode,
  getAllCodes,
  createCode,
  createBatch,
  updateCode,
  deleteCode,
  getCodeStats,
};
