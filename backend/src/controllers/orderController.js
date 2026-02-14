const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// جلب جميع الطلبات (أدمن)
async function getAllOrders(req, res) {
  try {
    const { site_key } = req.user;
    const { page, limit, status, customer_id } = req.query;

    const orders = await Order.findBySiteKey(site_key, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      status,
      customer_id: customer_id ? parseInt(customer_id) : undefined
    });

    const stats = await Order.getStats(site_key);

    res.json({ orders, stats });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الطلبات' });
  }
}

// إنشاء طلب (من الزبون)
async function createOrder(req, res) {
  try {
    const { site_key } = req.user;
    const { customer_id, product_id, product_name, quantity, unit_price, payment_method, imei, notes } = req.body;

    if (!customer_id || !product_name || !unit_price) {
      return res.status(400).json({ error: 'بيانات الطلب غير مكتملة' });
    }

    const qty = quantity || 1;
    const total_price = parseFloat(unit_price) * qty;

    // التحقق من رصيد المحفظة إذا كان الدفع من المحفظة
    if (payment_method === 'wallet') {
      const customer = await Customer.findById(customer_id);
      if (!customer || customer.site_key !== site_key) {
        return res.status(404).json({ error: 'الزبون غير موجود' });
      }
      if (parseFloat(customer.wallet_balance) < total_price) {
        return res.status(400).json({ error: 'رصيد المحفظة غير كافٍ' });
      }

      // خصم من المحفظة
      await Customer.updateWallet(customer_id, site_key, -total_price);
    }

    const order = await Order.create({
      site_key, customer_id, product_id, product_name, quantity: qty,
      unit_price: parseFloat(unit_price), total_price, payment_method, imei, notes
    });

    // تسجيل الدفع
    if (payment_method === 'wallet') {
      await Payment.create({
        site_key, customer_id, order_id: order.id,
        type: 'purchase', amount: total_price, payment_method: 'wallet', status: 'completed',
        description: `شراء: ${product_name}`
      });
      await Order.updatePaymentStatus(order.id, site_key, 'paid');
    }

    // إشعار للأدمن
    await Notification.create({
      site_key, recipient_type: 'admin', title: 'طلب جديد',
      message: `طلب جديد #${order.order_number} - ${product_name}`,
      type: 'order', link: `/orders/${order.id}`
    });

    // سجل النشاط
    await ActivityLog.log({
      site_key, customer_id, action: 'order_created',
      entity_type: 'order', entity_id: order.id,
      details: { product_name, total_price, payment_method }
    });

    res.status(201).json({ message: 'تم إنشاء الطلب بنجاح', order });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الطلب' });
  }
}

// تحديث حالة الطلب (أدمن)
async function updateOrderStatus(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { status, server_response } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'الحالة مطلوبة' });
    }

    const order = await Order.updateStatus(id, site_key, status, server_response);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    // إشعار للزبون
    if (order.customer_id) {
      await Notification.create({
        site_key, recipient_type: 'customer', recipient_id: order.customer_id,
        title: 'تحديث الطلب',
        message: `تم تحديث حالة طلبك #${order.order_number} إلى: ${status}`,
        type: 'order'
      });
    }

    // استرجاع المبلغ في حالة الإلغاء
    if (status === 'refunded' && order.payment_status === 'paid') {
      await Customer.updateWallet(order.customer_id, site_key, parseFloat(order.total_price));
      await Payment.create({
        site_key, customer_id: order.customer_id, order_id: order.id,
        type: 'refund', amount: parseFloat(order.total_price),
        payment_method: 'wallet', status: 'completed',
        description: `استرجاع: طلب #${order.order_number}`
      });
      await Order.updatePaymentStatus(id, site_key, 'refunded');
    }

    res.json({ message: 'تم تحديث حالة الطلب', order });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الطلب' });
  }
}

// إحصائيات الطلبات
async function getOrderStats(req, res) {
  try {
    const { site_key } = req.user;
    const stats = await Order.getStats(site_key);
    res.json({ stats });
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

module.exports = {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  getOrderStats
};
