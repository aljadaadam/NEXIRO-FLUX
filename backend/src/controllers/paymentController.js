const Payment = require('../models/Payment');
const { creditWalletOnce } = require('../services/walletCredit');

// جلب جميع المدفوعات
async function getAllPayments(req, res) {
  try {
    const siteKey = req.siteKey || req.user?.site_key;
    const { page = 1, limit = 50, type, customer_id, search } = req.query;

    const effectiveCustomerId = req.user?.role === 'customer'
      ? req.user.id
      : (customer_id ? parseInt(customer_id) : undefined);

    const payments = await Payment.findBySiteKey(siteKey, {
      page: parseInt(page),
      limit: Math.min(parseInt(limit) || 50, 200),
      type,
      customer_id: effectiveCustomerId,
      search: search || undefined,
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

    // Security: customers cannot create deposit payments directly — must use checkout flow
    const validTypes = ['purchase', 'deposit', 'subscription', 'refund'];
    const paymentType = validTypes.includes(type) ? type : 'purchase';
    if (req.user?.role === 'customer' && paymentType === 'deposit') {
      return res.status(403).json({ error: 'يرجى استخدام بوابة الدفع لشحن المحفظة' });
    }

    const validMethods = ['wallet', 'binance', 'paypal', 'bank_transfer', 'e_wallet', 'credit_card', 'crypto'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({ error: `طريقة الدفع غير صالحة. الطرق المتاحة: ${validMethods.join(', ')}` });
    }

    const payment = await Payment.create({
      site_key: siteKey,
      customer_id: effectiveCustomerId,
      order_id,
      type: paymentType,
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

    const validStatuses = ['pending', 'awaiting_receipt', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `حالة غير صالحة. الحالات المتاحة: ${validStatuses.join(', ')}` });
    }

    const payment = await Payment.findById(parseInt(id));
    if (!payment || payment.site_key !== siteKey) {
      return res.status(404).json({ error: 'عملية الدفع غير موجودة' });
    }

    // منع التحديث إذا كانت الدفعة بنفس الحالة (حماية من Race Condition)
    if (payment.status === status) {
      return res.json({ message: 'الحالة محدّثة مسبقاً', payment });
    }

    // منع إعادة إكمال دفعة مكتملة
    if (payment.status === 'completed' && status === 'completed') {
      return res.status(400).json({ error: 'الدفعة مكتملة مسبقاً' });
    }

    // تحديث ذري: فقط إذا لم تتغير الحالة منذ القراءة
    const updated = await Payment.updateStatusAtomic(parseInt(id), siteKey, payment.status, status);
    if (!updated) {
      return res.status(409).json({ error: 'تم تحديث الدفعة من مكان آخر، يرجى المحاولة مرة أخرى' });
    }

    // إذا تمت الموافقة على إيداع معلّق، أضف الرصيد للعميل
    if (status === 'completed' && ['pending', 'awaiting_receipt'].includes(payment.status) && payment.type === 'deposit') {
      try {
        await creditWalletOnce({ paymentId: payment.id, siteKey });
      } catch (e) {
        console.error('خطأ في إضافة الرصيد للمحفظة:', e);
      }
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

    // حماية: الزبون يرى فقط دفعاته
    if (req.user?.role === 'customer' && payment.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'غير مصرح بالوصول لهذه الدفعة' });
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
