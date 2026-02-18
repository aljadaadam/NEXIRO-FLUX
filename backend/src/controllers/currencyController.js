const Currency = require('../models/Currency');

// جلب جميع العملات
async function getCurrencies(req, res) {
  try {
    const { site_key } = req.user;
    const currencies = await Currency.findBySiteKey(site_key);
    res.json({ currencies });
  } catch (error) {
    console.error('Error in getCurrencies:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب العملات' });
  }
}

// إنشاء عملة
async function createCurrency(req, res) {
  try {
    const { site_key } = req.user;
    const { code, name, symbol, exchange_rate, is_default, is_active } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'رمز العملة واسمها مطلوبان' });
    }
    const currency = await Currency.create(site_key, { code, name, symbol, exchange_rate, is_default, is_active });
    res.status(201).json({ message: 'تم إنشاء العملة', currency });
  } catch (error) {
    console.error('Error in createCurrency:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء العملة' });
  }
}

// تحديث عملة
async function updateCurrency(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const currency = await Currency.update(id, site_key, req.body);
    if (!currency) {
      return res.status(404).json({ error: 'العملة غير موجودة' });
    }
    res.json({ message: 'تم تحديث العملة', currency });
  } catch (error) {
    console.error('Error in updateCurrency:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث العملة' });
  }
}

// حذف عملة
async function deleteCurrency(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const deleted = await Currency.delete(id, site_key);
    if (!deleted) {
      return res.status(404).json({ error: 'العملة غير موجودة' });
    }
    res.json({ message: 'تم حذف العملة' });
  } catch (error) {
    console.error('Error in deleteCurrency:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف العملة' });
  }
}

module.exports = {
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency
};
