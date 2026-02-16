const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Source = require('../models/Source');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const emailService = require('../services/email');
const { DhruFusionClient, DhruFusionError } = require('../services/dhruFusion');
const { decryptApiKey } = require('../utils/apiKeyCrypto');

// ─── ترجمة أخطاء المصدر للعربية ─────────────────────────────
function translateSourceError(msg) {
  const m = (msg || '').toLowerCase();
  const map = {
    'invalid imei':        'رقم IMEI غير صالح',
    'imei not found':      'رقم IMEI غير موجود',
    'blacklisted':         'الجهاز في القائمة السوداء',
    'already unlocked':    'الجهاز مفتوح مسبقاً',
    'not supported':       'الجهاز غير مدعوم',
    'invalid serial':      'الرقم التسلسلي غير صالح',
    'wrong model':         'موديل غير متوافق',
    'duplicate order':     'يوجد طلب مشابه قيد المعالجة',
    'invalid service':     'الخدمة غير متوفرة',
    'insufficient balance':'رصيد المصدر غير كافٍ',
    'insufficient credit': 'رصيد المصدر غير كافٍ',
    'service not found':   'الخدمة غير موجودة في المصدر',
    'incorrect':           'البيانات المدخلة غير صحيحة',
  };
  for (const [key, val] of Object.entries(map)) {
    if (m.includes(key)) return val;
  }
  return 'لم يتم قبول الطلب من المصدر';
}

// جلب جميع الطلبات (أدمن)
async function getAllOrders(req, res) {
  try {
    const { site_key, role, id: requesterId } = req.user;
    const { page, limit, status, customer_id } = req.query;

    const effectiveCustomerId = role === 'customer'
      ? requesterId
      : (customer_id ? parseInt(customer_id) : undefined);

    const orders = await Order.findBySiteKey(site_key, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      status,
      customer_id: effectiveCustomerId
    });

    if (role === 'customer') {
      return res.json({ orders });
    }

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
    const { site_key, role, id: requesterId } = req.user;
    const { customer_id, product_id, product_name, quantity, unit_price, payment_method, imei, notes } = req.body;

    const effectiveCustomerId = role === 'customer'
      ? requesterId
      : customer_id;

    if (!effectiveCustomerId || !product_name || !unit_price) {
      return res.status(400).json({ error: 'بيانات الطلب غير مكتملة' });
    }

    const qty = quantity || 1;
    const total_price = parseFloat(unit_price) * qty;

    // التحقق من رصيد المحفظة إذا كان الدفع من المحفظة
    if (payment_method === 'wallet') {
      const customer = await Customer.findById(effectiveCustomerId);
      if (!customer || customer.site_key !== site_key) {
        return res.status(404).json({ error: 'الزبون غير موجود' });
      }
      if (parseFloat(customer.wallet_balance) < total_price) {
        return res.status(400).json({ error: 'رصيد المحفظة غير كافٍ' });
      }

      // خصم من المحفظة
      await Customer.updateWallet(effectiveCustomerId, site_key, -total_price);
    }

    const order = await Order.create({
      site_key, customer_id: effectiveCustomerId, product_id, product_name, quantity: qty,
      unit_price: parseFloat(unit_price), total_price, payment_method, imei, notes
    });

    // تسجيل الدفع
    if (payment_method === 'wallet') {
      await Payment.create({
        site_key, customer_id: effectiveCustomerId, order_id: order.id,
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
      site_key, customer_id: effectiveCustomerId, action: 'order_created',
      entity_type: 'order', entity_id: order.id,
      details: { product_name, total_price, payment_method }
    });

    // بريد تأكيد الطلب للزبون + تنبيه للأدمن
    try {
      const cust = await Customer.findById(effectiveCustomerId);
      if (cust?.email) {
        emailService.sendOrderConfirmation({
          to: cust.email, name: cust.name, orderId: order.order_number,
          items: [{ name: product_name, quantity: qty, price: parseFloat(unit_price) }],
          total: total_price, currency: 'USD'
        }).catch(() => {});
      }
    } catch (e) { /* ignore */ }

    // ─── إرسال تلقائي للمصدر الخارجي (إذا المنتج مرتبط بمصدر) ───
    let externalResult = null;
    if (product_id) {
      try {
        const { getPool } = require('../config/db');
        const pool = getPool();
        const [products] = await pool.query('SELECT * FROM products WHERE id = ? AND site_key = ?', [product_id, site_key]);
        let product = products[0];

        // ─── تحويل الاتصال: إذا المنتج محوّل لمنتج آخر، نستخدم المنتج المحوّل إليه ───
        if (product && product.linked_product_id) {
          const [linkedProducts] = await pool.query('SELECT * FROM products WHERE id = ? AND site_key = ?', [product.linked_product_id, site_key]);
          if (linkedProducts[0]) {
            console.log(`🔗 Order #${order.order_number} → تحويل من منتج #${product.id} إلى منتج #${linkedProducts[0].id}`);
            product = linkedProducts[0];
          }
        }

        if (product && product.source_id) {
          const source = await Source.findById(product.source_id);
          const dhruTypes = ['dhru-fusion', 'sd-unlocker', 'unlock-world'];

          if (source && source.site_key === site_key && dhruTypes.includes(source.type)) {
            const apiKey = decryptApiKey(source.api_key);
            if (apiKey) {
              const serviceId = product.external_service_id || product.external_service_key;
              const orderImei = imei || null;
              const productServiceType = String(product.service_type || '').toUpperCase();

              if (serviceId && (orderImei || productServiceType === 'SERVER')) {
                const client = new DhruFusionClient({
                  baseUrl: source.url,
                  username: source.username || '',
                  apiAccessKey: apiKey
                });

                try {
                  const result = await client.placeOrder({
                    serviceId,
                    imei: orderImei,
                    quantity: qty,
                    customFields: notes ? (() => { try { return JSON.parse(notes); } catch { return null; } })() : null
                  });

                  if (result.referenceId) {
                    // ✅ نجاح — حفظ Reference ID وتحديث الحالة
                    await pool.query(
                      `UPDATE orders SET external_reference_id = ?, source_id = ?, status = 'processing' WHERE id = ? AND site_key = ?`,
                      [result.referenceId, source.id, order.id, site_key]
                    );
                    externalResult = { ok: true, referenceId: result.referenceId };
                    console.log(`✅ Order #${order.order_number} → Ref: ${result.referenceId}`);
                  }
                } catch (sourceErr) {
                  // ❌ المصدر رفض الطلب — استرجاع الرصيد
                  const errMsg = sourceErr instanceof DhruFusionError
                    ? sourceErr.message
                    : (sourceErr.message || 'خطأ اتصال بالمصدر');
                  const translatedErr = translateSourceError(errMsg);
                  const isConnectionError = !(sourceErr instanceof DhruFusionError);

                  if (isConnectionError) {
                    // مشكلة اتصال → الطلب يبقى pending
                    await pool.query(
                      `UPDATE orders SET status = 'pending', server_response = ? WHERE id = ? AND site_key = ?`,
                      [translatedErr || errMsg, order.id, site_key]
                    );
                    externalResult = { ok: false, type: 'CONNECTION_ERROR', error: errMsg };
                    console.log(`⏳ Order #${order.order_number} → PENDING (اتصال فاشل)`);
                  } else {
                    // المصدر رفض → استرجاع الرصيد
                    if (payment_method === 'wallet') {
                      await Customer.updateWallet(effectiveCustomerId, site_key, total_price);
                      await Payment.create({
                        site_key, customer_id: effectiveCustomerId, order_id: order.id,
                        type: 'refund', amount: total_price, payment_method: 'wallet', status: 'completed',
                        description: `استرجاع: ${translatedErr}`
                      });
                      await Order.updatePaymentStatus(order.id, site_key, 'refunded');
                    }
                    await pool.query(
                      `UPDATE orders SET status = 'failed', server_response = ? WHERE id = ? AND site_key = ?`,
                      [translatedErr || errMsg, order.id, site_key]
                    );
                    // إشعار الزبون
                    await Notification.create({
                      site_key, recipient_type: 'customer', recipient_id: effectiveCustomerId,
                      title: 'تحديث الطلب',
                      message: `طلبك #${order.order_number}: ${translatedErr}`,
                      type: 'order'
                    });
                    externalResult = { ok: false, type: 'ORDER_REJECTED', error: translatedErr };
                    console.log(`🚫 Order #${order.order_number} → REJECTED + Refunded: ${translatedErr}`);
                  }
                }
              }
            }
          }
        }
      } catch (extErr) {
        console.error('Auto external order error (non-blocking):', extErr.message);
      }
    }

    // إرجاع الطلب المحدّث
    const finalOrder = await Order.findById(order.id);
    const response = { message: 'تم إنشاء الطلب بنجاح', order: finalOrder };
    if (externalResult) response.external = externalResult;
    res.status(201).json(response);
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
      const statusLabels = {
        pending: 'معلق',
        processing: 'جارٍ التنفيذ',
        completed: 'مكتمل',
        failed: 'مرفوض',
        cancelled: 'ملغي',
        refunded: 'مسترجع'
      };
      const arStatus = statusLabels[status] || status;

      await Notification.create({
        site_key, recipient_type: 'customer', recipient_id: order.customer_id,
        title: 'تحديث الطلب',
        message: `تم تحديث حالة طلبك #${order.order_number} إلى: ${arStatus}`,
        type: 'order'
      });

      // بريد تحديث الطلب
      try {
        const cust = await Customer.findById(order.customer_id);
        if (cust?.email) {
          emailService.sendOrderStatusUpdate({
            to: cust.email, name: cust.name,
            orderId: order.order_number, status
          }).catch(() => {});
        }
      } catch (e) { /* ignore */ }
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

// ─── إرسال طلب إلى المصدر الخارجي (DHRU FUSION) ──────────────────
async function placeExternalOrder(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params; // order ID

    const order = await Order.findById(id);
    if (!order || order.site_key !== site_key) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    if (!order.product_id) {
      return res.status(400).json({ error: 'الطلب غير مرتبط بمنتج' });
    }

    // جلب المنتج والمصدر
    const { getPool } = require('../config/db');
    const pool = getPool();
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND site_key = ?',
      [order.product_id, site_key]
    );
    let product = products[0];
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    // ─── تحويل الاتصال: إذا المنتج محوّل لمنتج آخر ───
    if (product.linked_product_id) {
      const [linkedProducts] = await pool.query('SELECT * FROM products WHERE id = ? AND site_key = ?', [product.linked_product_id, site_key]);
      if (linkedProducts[0]) {
        console.log(`🔗 Manual send: تحويل من منتج #${product.id} إلى منتج #${linkedProducts[0].id}`);
        product = linkedProducts[0];
      }
    }

    if (!product.source_id) {
      return res.status(400).json({ error: 'المنتج غير مرتبط بمصدر خارجي' });
    }

    const source = await Source.findById(product.source_id);
    if (!source || source.site_key !== site_key) {
      return res.status(404).json({ error: 'المصدر غير موجود' });
    }

    // التحقق من نوع المصدر
    const dhruTypes = ['dhru-fusion', 'sd-unlocker', 'unlock-world'];
    if (!dhruTypes.includes(source.type)) {
      return res.status(400).json({ error: 'هذا المصدر لا يدعم الإرسال التلقائي' });
    }

    const apiKey = decryptApiKey(source.api_key);
    if (!apiKey) {
      return res.status(400).json({ error: 'مفتاح API المصدر غير صالح' });
    }

    // إنشاء اتصال DHRU FUSION
    const client = new DhruFusionClient({
      baseUrl: source.url,
      username: source.username || '',
      apiAccessKey: apiKey
    });

    // تحديد الـ serviceId
    const serviceId = product.external_service_id || product.external_service_key;
    if (!serviceId) {
      return res.status(400).json({ error: 'المنتج غير مرتبط بخدمة في المصدر' });
    }

    const imei = req.body.imei || order.imei;
    const productServiceType = String(product.service_type || '').toUpperCase();
    if (!imei && productServiceType !== 'SERVER') {
      return res.status(400).json({ error: 'IMEI مطلوب لهذا الطلب' });
    }

    // إرسال الطلب
    const result = await client.placeOrder({
      serviceId,
      imei: imei || '',
      quantity: order.quantity || 1,
      customFields: req.body.customFields || null
    });

    if (!result.referenceId) {
      return res.status(500).json({ error: 'لم يتم الحصول على رقم مرجع من المصدر' });
    }

    // تحديث الطلب بالرقم المرجعي
    await pool.query(
      `UPDATE orders SET 
        external_reference_id = ?,
        source_id = ?,
        status = 'processing'
      WHERE id = ? AND site_key = ?`,
      [result.referenceId, source.id, id, site_key]
    );

    // إشعار
    await Notification.create({
      site_key,
      recipient_type: 'admin',
      title: 'تم إرسال الطلب للمصدر',
      message: `طلب #${order.order_number} → المرجع: ${result.referenceId}`,
      type: 'order',
      link: `/orders/${order.id}`
    });

    const updatedOrder = await Order.findById(id);
    res.json({
      success: true,
      message: 'تم إرسال الطلب للمصدر بنجاح',
      referenceId: result.referenceId,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error in placeExternalOrder:', error);
    if (error instanceof DhruFusionError) {
      return res.status(400).json({
        error: `خطأ من المصدر: ${error.message}`,
        fullDescription: error.fullDescription
      });
    }
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء إرسال الطلب' });
  }
}

// ─── متابعة حالة طلب من المصدر الخارجي ─────────────────────────
async function checkExternalOrderStatus(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;

    const { getPool } = require('../config/db');
    const pool = getPool();
    
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND site_key = ?',
      [id, site_key]
    );
    const order = orders[0];
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    if (!order.external_reference_id) {
      return res.status(400).json({ error: 'لا يوجد رقم مرجعي لهذا الطلب' });
    }

    // جلب المصدر
    const sourceId = order.source_id || (order.product_id ? (await (async () => {
      const [p] = await pool.query('SELECT source_id FROM products WHERE id = ?', [order.product_id]);
      return p[0]?.source_id;
    })()) : null);

    if (!sourceId) {
      return res.status(400).json({ error: 'لا يمكن تحديد المصدر' });
    }

    const source = await Source.findById(sourceId);
    if (!source) {
      return res.status(404).json({ error: 'المصدر غير موجود' });
    }

    const apiKey = decryptApiKey(source.api_key);
    const client = new DhruFusionClient({
      baseUrl: source.url,
      username: source.username || '',
      apiAccessKey: apiKey
    });

    const result = await client.getOrderStatus(order.external_reference_id);

    // تحديث حالة الطلب محلياً
    const statusMapping = {
      'completed': 'completed',
      'waiting': 'processing',
      'pending': 'processing',
      'rejected': 'failed',
      'cancelled': 'cancelled'
    };

    const newStatus = statusMapping[result.status] || order.status;
    const serverResponseData = {
      dhruStatus: result.statusCode,
      dhruStatusLabel: result.statusLabel,
      comments: result.comments,
      message: result.message,
      checkedAt: new Date().toISOString()
    };

    await Order.updateStatus(id, site_key, newStatus, JSON.stringify(serverResponseData));

    // إذا اكتمل الطلب، أرسل إشعار
    if (result.status === 'completed' && order.status !== 'completed') {
      await Notification.create({
        site_key,
        recipient_type: 'customer',
        recipient_id: order.customer_id,
        title: 'تم إكمال طلبك',
        message: `طلبك #${order.order_number} تم بنجاح${result.comments ? ': ' + result.comments : ''}`,
        type: 'order'
      });

      // إيميل للزبون
      try {
        const cust = await Customer.findById(order.customer_id);
        if (cust?.email) {
          emailService.sendOrderStatusUpdate({
            to: cust.email,
            name: cust.name,
            orderId: order.order_number,
            status: 'completed'
          }).catch(() => {});
        }
      } catch { /* ignore */ }
    }

    // إذا فشل أو رُفض، أرسل إشعار
    if (['rejected', 'cancelled'].includes(result.status) && !['failed', 'cancelled'].includes(order.status)) {
      await Notification.create({
        site_key,
        recipient_type: 'customer',
        recipient_id: order.customer_id,
        title: 'تحديث الطلب',
        message: `طلبك #${order.order_number}: ${result.statusLabel}${result.message ? ' - ' + result.message : ''}`,
        type: 'order'
      });
    }

    const updatedOrder = await Order.findById(id);
    res.json({
      success: true,
      externalStatus: result,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error in checkExternalOrderStatus:', error);
    if (error instanceof DhruFusionError) {
      return res.status(400).json({
        error: `خطأ من المصدر: ${error.message}`,
        fullDescription: error.fullDescription
      });
    }
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء فحص حالة الطلب' });
  }
}

// ─── فحص جماعي لحالة الطلبات المعلقة ──────────────────────────
async function bulkCheckExternalOrders(req, res) {
  try {
    const { site_key } = req.user;
    const { getPool } = require('../config/db');
    const pool = getPool();

    // جلب جميع الطلبات المعلقة التي لها reference
    const [pendingOrders] = await pool.query(
      `SELECT o.*, p.source_id as product_source_id 
       FROM orders o 
       LEFT JOIN products p ON o.product_id = p.id 
       WHERE o.site_key = ? 
         AND o.external_reference_id IS NOT NULL 
         AND o.status IN ('pending', 'processing')
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [site_key]
    );

    if (pendingOrders.length === 0) {
      return res.json({ success: true, checked: 0, results: [] });
    }

    // تجميع حسب المصدر
    const sourceCache = {};
    const results = [];

    for (const order of pendingOrders) {
      const srcId = order.source_id || order.product_source_id;
      if (!srcId) {
        results.push({ orderId: order.id, status: 'skipped', reason: 'no source' });
        continue;
      }

      try {
        if (!sourceCache[srcId]) {
          const source = await Source.findById(srcId);
          if (!source) {
            results.push({ orderId: order.id, status: 'skipped', reason: 'source not found' });
            continue;
          }
          const apiKey = decryptApiKey(source.api_key);
          sourceCache[srcId] = new DhruFusionClient({
            baseUrl: source.url,
            username: source.username || '',
            apiAccessKey: apiKey
          });
        }

        const client = sourceCache[srcId];
        const result = await client.getOrderStatus(order.external_reference_id);

        const statusMapping = {
          'completed': 'completed',
          'waiting': 'processing',
          'pending': 'processing',
          'rejected': 'failed',
          'cancelled': 'cancelled'
        };

        const newStatus = statusMapping[result.status] || order.status;
        if (newStatus !== order.status) {
          await Order.updateStatus(order.id, site_key, newStatus, JSON.stringify({
            dhruStatus: result.statusCode,
            comments: result.comments,
            message: result.message,
            checkedAt: new Date().toISOString()
          }));
        }

        results.push({
          orderId: order.id,
          orderNumber: order.order_number,
          previousStatus: order.status,
          newStatus,
          externalStatus: result.statusLabel,
          comments: result.comments
        });
      } catch (err) {
        results.push({
          orderId: order.id,
          orderNumber: order.order_number,
          status: 'error',
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      checked: results.length,
      results
    });
  } catch (error) {
    console.error('Error in bulkCheckExternalOrders:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء فحص الطلبات' });
  }
}

module.exports = {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  getOrderStats,
  placeExternalOrder,
  checkExternalOrderStatus,
  bulkCheckExternalOrders
};
