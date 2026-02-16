const Payment = require('../models/Payment');

// جلب جميع المدفوعات
async function getAllPayments(req, res) {
  try {
    const siteKey = req.siteKey || req.user?.site_key;
    const { page = 1, limit = 50, type, customer_id } = req.query;

    const effectiveCustomerId = req.user?.role === 'customer'
      ? req.user.id
      : (customer_id ? parseInt(customer_id) : undefined);

    const payments = await Payment.findBySiteKey(siteKey, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      customer_id: effectiveCustomerId
    });
    res.json({ payments });
  } catch (error) {
    console.error('خطأ في جلب المدفوعات:', error);
    res.status(500).json({ error: 'فشل في جلب المدفوعات' });
  }
}

// إنشاء عملية دفع
async function createPayment(req, res) {
  try {
    const siteKey = req.siteKey || req.user?.site_key;
    const { customer_id, order_id, type, amount, currency, payment_method, payment_gateway_id, description } = req.body;

    const effectiveCustomerId = req.user?.role === 'customer'
      ? req.user.id
      : customer_id;

    if (!amount || !payment_method) {
      return res.status(400).json({ error: 'المبلغ وطريقة الدفع مطلوبان' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'المبلغ يجب أن يكون أكبر من 0' });
    }

    const validMethods = ['wallet', 'binance', 'paypal', 'bank_transfer', 'e_wallet', 'credit_card', 'crypto'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({ error: `طريقة الدفع غير صالحة. الطرق المتاحة: ${validMethods.join(', ')}` });
    }

    const payment = await Payment.create({
      site_key: siteKey,
      customer_id: effectiveCustomerId,
      order_id,
      type: type || 'purchase',
      amount: parseFloat(amount),
      currency: currency || 'USD',
      payment_method,
      payment_gateway_id,
      status: 'pending',
      description
    });

    res.status(201).json({
      message: 'تم إنشاء عملية الدفع بنجاح',
      payment
    });
  } catch (error) {
    console.error('خطأ في إنشاء الدفع:', error);
    res.status(500).json({ error: 'فشل في إنشاء عملية الدفع' });
  }
}

// تحديث حالة الدفع
async function updatePaymentStatus(req, res) {
  try {
    const siteKey = req.siteKey || req.user?.site_key;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `حالة غير صالحة. الحالات المتاحة: ${validStatuses.join(', ')}` });
    }

    const payment = await Payment.findById(parseInt(id));
    if (!payment || payment.site_key !== siteKey) {
      return res.status(404).json({ error: 'عملية الدفع غير موجودة' });
    }

    const updated = await Payment.updateStatus(parseInt(id), siteKey, status);
    if (!updated) {
      return res.status(500).json({ error: 'فشل في تحديث حالة الدفع' });
    }

    const updatedPayment = await Payment.findById(parseInt(id));
    res.json({
      message: 'تم تحديث حالة الدفع بنجاح',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة الدفع:', error);
    res.status(500).json({ error: 'فشل في تحديث حالة الدفع' });
  }
}

// إحصائيات المدفوعات
async function getPaymentStats(req, res) {
  try {
    const siteKey = req.siteKey || req.user?.site_key;
    const stats = await Payment.getStats(siteKey);
    res.json({ stats });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المدفوعات:', error);
    res.status(500).json({ error: 'فشل في جلب الإحصائيات' });
  }
}

// جلب دفعة واحدة بالـ ID
async function getPaymentById(req, res) {
  try {
    const siteKey = req.siteKey || req.user?.site_key;
    const { id } = req.params;
    const payment = await Payment.findById(parseInt(id));

    if (!payment || payment.site_key !== siteKey) {
      return res.status(404).json({ error: 'عملية الدفع غير موجودة' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('خطأ في جلب الدفعة:', error);
    res.status(500).json({ error: 'فشل في جلب الدفعة' });
  }
}

module.exports = {
  getAllPayments,
  createPayment,
  updatePaymentStatus,
  getPaymentStats,
  getPaymentById
};
