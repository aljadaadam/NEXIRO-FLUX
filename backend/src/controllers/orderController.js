const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Source = require('../models/Source');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const emailService = require('../services/email');
const { DhruFusionClient, DhruFusionError } = require('../services/dhruFusion');
const { ImeiCheckClient, ImeiCheckError } = require('../services/imeiCheck');
const { decryptApiKey } = require('../utils/apiKeyCrypto');
const { getPool } = require('../config/db');

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
    'credit error':        'رصيد المصدر غير كافٍ',
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
      limit: Math.min(parseInt(limit) || 50, 200),
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

    if (!effectiveCustomerId || !product_name) {
      return res.status(400).json({ error: 'بيانات الطلب غير مكتملة' });
    }

    // ─── حماية: جلب السعر الحقيقي من قاعدة البيانات — لا نثق بسعر الكلاينت ───
    let verifiedPrice;
    let productSourcePrice = null;
    const pool = getPool();

    // الزبون يجب أن يرسل product_id — لا نقبل سعر يدوي من الزبون
    if (role === 'customer' && !product_id) {
      return res.status(400).json({ error: 'product_id مطلوب' });
    }

    if (product_id) {
      const [productRows] = await pool.query(
        'SELECT price, source_price FROM products WHERE id = ? AND site_key = ?',
        [product_id, site_key]
      );
      if (!productRows.length || !productRows[0].price || productRows[0].price <= 0) {
        return res.status(404).json({ error: 'المنتج غير موجود أو بدون سعر' });
      }
      verifiedPrice = parseFloat(productRows[0].price);
      productSourcePrice = productRows[0].source_price != null ? parseFloat(productRows[0].source_price) : null;
    } else {
      // فقط الأدمن يمكنه تحديد سعر يدوي
      verifiedPrice = parseFloat(unit_price);
    }

    if (!Number.isFinite(verifiedPrice) || verifiedPrice <= 0) {
      return res.status(400).json({ error: 'السعر غير صالح' });
    }

    const qty = quantity || 1;
    const total_price = verifiedPrice * qty;

    // التحقق من رصيد المحفظة وخصمه بأمان (transaction + row lock)
    if (payment_method === 'wallet') {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        // قفل صف الزبون لمنع السحب المزدوج
        const [rows] = await conn.query(
          'SELECT id, wallet_balance, site_key FROM customers WHERE id = ? AND site_key = ? FOR UPDATE',
          [effectiveCustomerId, site_key]
        );
        if (!rows[0]) {
          await conn.rollback();
          conn.release();
          return res.status(404).json({ error: 'الزبون غير موجود' });
        }
        if (parseFloat(rows[0].wallet_balance) < total_price) {
          await conn.rollback();
          conn.release();
          return res.status(400).json({ error: 'رصيد المحفظة غير كافٍ' });
        }
        // خصم من المحفظة داخل الـ transaction
        await conn.query(
          'UPDATE customers SET wallet_balance = wallet_balance - ? WHERE id = ? AND site_key = ?',
          [total_price, effectiveCustomerId, site_key]
        );
        await conn.commit();
        conn.release();
      } catch (txErr) {
        await conn.rollback().catch(() => {});
        conn.release();
        throw txErr;
      }
    }

    // ─── حماية من الطلب المزدوج: لا نقبل طلب مماثل خلال 30 ثانية ───
    if (role === 'customer' && product_id) {
      const [recentDup] = await pool.query(
        `SELECT id FROM orders WHERE site_key = ? AND customer_id = ? AND product_id = ? AND imei <=> ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND) LIMIT 1`,
        [site_key, effectiveCustomerId, product_id, imei || null]
      );
      if (recentDup.length > 0) {
        // استرجاع الرصيد إذا تم خصمه
        if (payment_method === 'wallet') {
          await pool.query('UPDATE customers SET wallet_balance = wallet_balance + ? WHERE id = ? AND site_key = ?', [total_price, effectiveCustomerId, site_key]);
        }
        return res.status(409).json({ error: 'تم إرسال طلب مماثل مؤخراً، يرجى الانتظار' });
      }
    }

    const order = await Order.create({
      site_key, customer_id: effectiveCustomerId, product_id, product_name, quantity: qty,
      unit_price: verifiedPrice, total_price, payment_method, imei, notes, source_price: productSourcePrice
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
          total: total_price, currency: 'USD', siteKey: site_key
        }).catch(() => {});
      }
    } catch (e) { /* ignore */ }

    // تنبيه الأدمن بالطلب الجديد
    try {
      const cust2 = await Customer.findById(effectiveCustomerId);
      emailService.sendNewOrderAlert({
        orderId: order.order_number,
        customerName: cust2?.name || product_name,
        total: total_price, currency: 'USD', siteKey: site_key
      }).catch(() => {});
    } catch (e) { /* ignore */ }

    // ─── إرسال تلقائي للمصدر الخارجي (إذا المنتج مرتبط بمصدر) ───
    // محاولة واحدة فقط — أي فشل → رفض + استرجاع رصيد
    let externalResult = null;
    if (product_id) {
      try {
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
          const supportedTypes = [...dhruTypes, 'imeicheck'];

          if (source && source.site_key === site_key && supportedTypes.includes(source.type)) {
            const apiKey = decryptApiKey(source.api_key);
            if (apiKey) {
              const serviceId = product.external_service_id || product.external_service_key;
              const orderImei = imei || null;
              const productServiceType = String(product.service_type || '').toUpperCase();

              if (serviceId && (orderImei || productServiceType === 'SERVER')) {
                try {
                  // ─── IMEI Check: إرسال عبر PHP API ───
                  if (source.type === 'imeicheck') {
                    const phpBaseUrl = 'https://alpha.imeicheck.com/api/php-api';
                    const imeiClient = new ImeiCheckClient({ apiKey, baseUrl: phpBaseUrl });
                    const result = await imeiClient.createOrder({ serviceId, imei: orderImei });

                    if (result.orderId) {
                      await pool.query(
                        `UPDATE orders SET external_reference_id = ?, source_id = ?, status = 'processing' WHERE id = ? AND site_key = ?`,
                        [String(result.orderId), source.id, order.id, site_key]
                      );
                      externalResult = { ok: true, referenceId: String(result.orderId) };
                      console.log(`✅ Order #${order.order_number} → IMEI Check Order: ${result.orderId}`);

                      // إذا النتيجة جاهزة فوراً (instant)
                      if (result.status === 'completed' && result.result) {
                        await pool.query(
                          `UPDATE orders SET status = 'completed', server_response = ?, completed_at = NOW() WHERE id = ? AND site_key = ?`,
                          [result.result, order.id, site_key]
                        );
                        externalResult.instant = true;
                        externalResult.result = result.result;
                        console.log(`⚡ Order #${order.order_number} → Instant result from IMEI Check`);
                      }
                    }
                  }
                  // ─── DHRU Fusion وأشباهه ───
                  else {
                    const client = new DhruFusionClient({
                      baseUrl: source.url,
                      username: source.username || '',
                      apiAccessKey: apiKey
                    });

                    const result = await client.placeOrder({
                      serviceId,
                      imei: orderImei,
                      quantity: qty,
                      customFields: notes ? (() => { try { return JSON.parse(notes); } catch { return null; } })() : null
                    });

                    if (result.referenceId) {
                      await pool.query(
                        `UPDATE orders SET external_reference_id = ?, source_id = ?, status = 'processing' WHERE id = ? AND site_key = ?`,
                        [result.referenceId, source.id, order.id, site_key]
                      );
                      externalResult = { ok: true, referenceId: result.referenceId };
                      console.log(`✅ Order #${order.order_number} → Ref: ${result.referenceId}`);
                    }
                  }
                } catch (sourceErr) {
                  const isApiError = (sourceErr instanceof DhruFusionError || sourceErr instanceof ImeiCheckError);
                  const originalMsg = isApiError ? sourceErr.message : (sourceErr.message || 'خطأ اتصال بالمصدر');

                  if (isApiError) {
                    // ❌ خطأ صريح من API (مثل invalid IMEI, insufficient balance) → الطلب لم يُقبل أكيد → رفض + استرجاع
                    await pool.query(
                      `UPDATE orders SET status = 'rejected', source_id = ?, server_response = ? WHERE id = ? AND site_key = ?`,
                      [source.id, originalMsg, order.id, site_key]
                    );

                    // استرجاع رصيد المحفظة
                    if (payment_method === 'wallet' && total_price > 0) {
                      try {
                        await Customer.updateWallet(effectiveCustomerId, site_key, total_price);
                        await Payment.create({
                          site_key, customer_id: effectiveCustomerId, order_id: order.id,
                          type: 'refund', amount: total_price, payment_method: 'wallet', status: 'completed',
                          description: `استرجاع تلقائي: طلب #${order.order_number} (${originalMsg})`
                        });
                        await Order.updatePaymentStatus(order.id, site_key, 'refunded');
                        console.log(`💰 Order #${order.order_number} → استرجاع $${total_price} للزبون ${effectiveCustomerId}`);
                      } catch (refundErr) {
                        console.error(`❌ فشل استرجاع الرصيد لطلب #${order.order_number}:`, refundErr.message);
                      }
                    }

                    // إشعار الزبون
                    await Notification.create({
                      site_key, recipient_type: 'customer', recipient_id: effectiveCustomerId,
                      title: 'طلب مرفوض ❌',
                      message: `طلبك #${order.order_number} تم رفضه: ${originalMsg}${payment_method === 'wallet' ? '. تم استرجاع الرصيد لمحفظتك.' : ''}`,
                      type: 'order'
                    });

                    externalResult = { ok: false, type: 'SOURCE_ERROR', error: originalMsg, refunded: payment_method === 'wallet' };
                    console.log(`❌ Order #${order.order_number} → REJECTED (${originalMsg})`);

                  } else {
                    // ⚠️ خطأ اتصال (timeout, ECONNRESET, socket hang up) → لا نعرف هل الطلب تم أم لا
                    // الطلب يبقى pending + تحذير للأدمن + لا استرجاع
                    await pool.query(
                      `UPDATE orders SET source_id = ?, server_response = ? WHERE id = ? AND site_key = ?`,
                      [source.id, `⚠️ ${originalMsg}`, order.id, site_key]
                    );

                    // إشعار تحذيري للأدمن
                    await Notification.create({
                      site_key, recipient_type: 'admin',
                      title: '⚠️ خطأ اتصال بالمصدر',
                      message: `طلب #${order.order_number} — فشل الاتصال بالمصدر: ${originalMsg}. يرجى التحقق يدوياً.`,
                      type: 'order', link: `/orders/${order.id}`
                    });

                    externalResult = { ok: false, type: 'CONNECTION_ERROR', error: originalMsg, refunded: false };
                    console.log(`⚠️ Order #${order.order_number} → CONNECTION ERROR (${originalMsg}) — الطلب يبقى pending`);
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

// إلغاء طلب (من الزبون — فقط الطلبات المعلقة)
async function cancelCustomerOrder(req, res) {
  try {
    const { site_key, id: customerId } = req.user;
    const { id } = req.params;

    // تحقق من إعداد السماح بالإلغاء
    const Customization = require('../models/Customization');
    const settings = await Customization.findBySiteKey(site_key);
    if (!settings || !settings.allow_customer_cancel) {
      return res.status(403).json({ error: 'إلغاء الطلبات غير مفعّل حالياً' });
    }

    const order = await Order.findById(id);
    if (!order || order.site_key !== site_key) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }
    if (order.customer_id !== customerId) {
      return res.status(403).json({ error: 'غير مصرح' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'لا يمكن إلغاء هذا الطلب — فقط الطلبات المعلقة يمكن إلغاؤها' });
    }

    const updated = await Order.updateStatus(id, site_key, 'cancelled');
    if (!updated) {
      return res.status(500).json({ error: 'فشل في إلغاء الطلب' });
    }

    // استرجاع الرصيد إذا كان الدفع بالمحفظة
    if (order.payment_method === 'wallet' && order.payment_status === 'paid') {
      const pool = getPool();
      const [refundResult] = await pool.query(
        "UPDATE orders SET payment_status = 'refunded' WHERE id = ? AND site_key = ? AND payment_status = 'paid'",
        [id, site_key]
      );
      if (refundResult.affectedRows > 0 && order.customer_id) {
        await Customer.updateWallet(order.customer_id, site_key, parseFloat(order.total_price));
        await Payment.create({
          site_key, customer_id: order.customer_id, order_id: order.id,
          amount: parseFloat(order.total_price), type: 'refund',
          payment_method: 'wallet', status: 'completed',
          note: `استرجاع رصيد - إلغاء الطلب #${order.order_number} من قبل العميل`,
        });
      }
    }

    res.json({ message: 'تم إلغاء الطلب بنجاح', order: updated });
  } catch (error) {
    console.error('Error in cancelCustomerOrder:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إلغاء الطلب' });
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
        pending: 'الانتظار',
        processing: 'جارٍ التنفيذ',
        completed: 'مكتمل',
        rejected: 'مرفوض'
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
            orderId: order.order_number, status, siteKey: site_key
          }).catch(() => {});
        }
      } catch (e) { /* ignore */ }
    }

    // ─── إجراءات مالية حسب الحالة الجديدة ───
    const pool = getPool();

    // ❌ رفض → استرجاع الرصيد (حتى لو كان مكتمل سابقاً)
    if (status === 'rejected' && order.payment_method === 'wallet' && order.payment_status === 'paid') {
      const [refundResult] = await pool.query(
        "UPDATE orders SET payment_status = 'refunded' WHERE id = ? AND site_key = ? AND payment_status = 'paid'",
        [id, site_key]
      );
      if (refundResult.affectedRows > 0) {
        await Customer.updateWallet(order.customer_id, site_key, parseFloat(order.total_price));
        await Payment.create({
          site_key, customer_id: order.customer_id, order_id: order.id,
          type: 'refund', amount: parseFloat(order.total_price),
          payment_method: 'wallet', status: 'completed',
          description: `استرجاع: طلب #${order.order_number}`
        });
        console.log(`💰 استرجاع $${order.total_price} للزبون ${order.customer_id} — طلب #${order.order_number}`);
      }
    }

    // ✅ إكمال → إعادة خصم الرصيد (إذا سبق الاسترجاع)
    if (status === 'completed' && order.payment_method === 'wallet' && order.payment_status === 'refunded') {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        // قفل صف الزبون لمنع السحب المزدوج
        const [rows] = await conn.query(
          'SELECT wallet_balance FROM customers WHERE id = ? AND site_key = ? FOR UPDATE',
          [order.customer_id, site_key]
        );
        if (!rows[0] || parseFloat(rows[0].wallet_balance) < parseFloat(order.total_price)) {
          await conn.rollback();
          conn.release();
          // إرجاع الحالة للمرفوض لأن الرصيد غير كافٍ
          await Order.updateStatus(id, site_key, 'rejected', server_response);
          return res.status(400).json({ error: `رصيد الزبون غير كافٍ ($${rows[0] ? rows[0].wallet_balance : 0})` });
        }
        // خصم من المحفظة
        await conn.query(
          'UPDATE customers SET wallet_balance = wallet_balance - ? WHERE id = ? AND site_key = ?',
          [parseFloat(order.total_price), order.customer_id, site_key]
        );
        // تحديث payment_status ذرياً
        await conn.query(
          "UPDATE orders SET payment_status = 'paid' WHERE id = ? AND site_key = ? AND payment_status = 'refunded'",
          [id, site_key]
        );
        await conn.commit();
        conn.release();

        await Payment.create({
          site_key, customer_id: order.customer_id, order_id: order.id,
          type: 'purchase', amount: parseFloat(order.total_price),
          payment_method: 'wallet', status: 'completed',
          description: `إعادة خصم: طلب #${order.order_number}`
        });
        console.log(`💳 إعادة خصم $${order.total_price} من الزبون ${order.customer_id} — طلب #${order.order_number}`);
      } catch (txErr) {
        await conn.rollback().catch(() => {});
        conn.release();
        throw txErr;
      }
    }

    const finalOrder = await Order.findById(id);
    res.json({ message: 'تم تحديث حالة الطلب', order: finalOrder });
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

    // حماية من إعادة الإرسال المكرر
    if (order.external_reference_id) {
      return res.status(409).json({ error: 'تم إرسال هذا الطلب مسبقاً', referenceId: order.external_reference_id });
    }

    if (!order.product_id) {
      return res.status(400).json({ error: 'الطلب غير مرتبط بمنتج' });
    }

    // جلب المنتج والمصدر
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
    const supportedTypes = [...dhruTypes, 'imeicheck'];
    if (!supportedTypes.includes(source.type)) {
      return res.status(400).json({ error: 'هذا المصدر لا يدعم الإرسال التلقائي' });
    }

    const apiKey = decryptApiKey(source.api_key);
    if (!apiKey) {
      return res.status(400).json({ error: 'مفتاح API المصدر غير صالح' });
    }

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

    let referenceId;
    let instantResult = null;

    // ─── IMEI Check: إرسال عبر PHP API ───
    if (source.type === 'imeicheck') {
      const phpBaseUrl = 'https://alpha.imeicheck.com/api/php-api';
      const imeiClient = new ImeiCheckClient({ apiKey, baseUrl: phpBaseUrl });
      const result = await imeiClient.createOrder({ serviceId, imei: imei || '' });

      if (!result.orderId) {
        return res.status(500).json({ error: 'لم يتم الحصول على رقم طلب من IMEI Check' });
      }
      referenceId = String(result.orderId);

      // إذا النتيجة جاهزة فوراً (instant check)
      if (result.status === 'completed' && result.result) {
        instantResult = result.result;
      }
    }
    // ─── DHRU Fusion وأشباهه ───
    else {
      const client = new DhruFusionClient({
        baseUrl: source.url,
        username: source.username || '',
        apiAccessKey: apiKey
      });

      const result = await client.placeOrder({
        serviceId,
        imei: imei || '',
        quantity: order.quantity || 1,
        customFields: req.body.customFields || (() => { try { return order.notes ? JSON.parse(order.notes) : null; } catch { return null; } })()
      });

      if (!result.referenceId) {
        return res.status(500).json({ error: 'لم يتم الحصول على رقم مرجع من المصدر' });
      }
      referenceId = result.referenceId;
    }

    // تحديث الطلب بالرقم المرجعي
    if (instantResult) {
      await pool.query(
        `UPDATE orders SET 
          external_reference_id = ?,
          source_id = ?,
          status = 'completed',
          server_response = ?,
          completed_at = NOW()
        WHERE id = ? AND site_key = ?`,
        [referenceId, source.id, instantResult, id, site_key]
      );
    } else {
      await pool.query(
        `UPDATE orders SET 
          external_reference_id = ?,
          source_id = ?,
          status = 'processing'
        WHERE id = ? AND site_key = ?`,
        [referenceId, source.id, id, site_key]
      );
    }

    // إشعار
    await Notification.create({
      site_key,
      recipient_type: 'admin',
      title: 'تم إرسال الطلب للمصدر',
      message: `طلب #${order.order_number} → المرجع: ${referenceId}`,
      type: 'order',
      link: `/orders/${order.id}`
    });

    const updatedOrder = await Order.findById(id);
    res.json({
      success: true,
      message: instantResult ? 'تم إكمال الطلب فوراً' : 'تم إرسال الطلب للمصدر بنجاح',
      referenceId,
      instant: !!instantResult,
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
    if (error instanceof ImeiCheckError) {
      return res.status(400).json({
        error: `خطأ من IMEI Check: ${error.message}`
      });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء إرسال الطلب' });
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
    const dhruTypes = ['dhru-fusion', 'sd-unlocker', 'unlock-world'];
    let result;

    // ─── IMEI Check: فحص عبر ImeiCheckClient ───
    if (source.type === 'imeicheck') {
      const phpBaseUrl = 'https://alpha.imeicheck.com/api/php-api';
      const imeiClient = new ImeiCheckClient({ apiKey, baseUrl: phpBaseUrl });
      const historyResult = await imeiClient.getOrderHistory(order.external_reference_id);
      result = {
        status: historyResult.status,
        statusCode: historyResult.statusCode || historyResult.status,
        statusLabel: historyResult.statusLabel,
        comments: historyResult.result || null,
        message: historyResult.result || null,
        fullResponse: historyResult.result || historyResult.statusLabel || '',
      };
    }
    // ─── DHRU Fusion وأشباهه ───
    else if (dhruTypes.includes(source.type)) {
      const client = new DhruFusionClient({
        baseUrl: source.url,
        username: source.username || '',
        apiAccessKey: apiKey
      });
      result = await client.getOrderStatus(order.external_reference_id);
    } else {
      return res.status(400).json({ error: 'نوع المصدر غير مدعوم للفحص' });
    }

    // تحديث حالة الطلب محلياً
    const statusMapping = {
      'completed': 'completed',
      'waiting': 'processing',
      'pending': 'processing',
      'rejected': 'rejected',
      'cancelled': 'rejected'
    };

    const newStatus = statusMapping[result.status] || order.status;
    // حفظ المحتوى الفعلي كنص عادي (متوافق مع الكرون والفرونتند)
    const responseText = result.fullResponse || result.comments || result.message || result.statusLabel || '';

    await Order.updateStatus(id, site_key, newStatus, responseText);

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
            status: 'completed',
            siteKey: site_key
          }).catch(() => {});
        }
      } catch { /* ignore */ }
    }

    // إذا رُفض — استرجاع تلقائي + إشعار
    if (['rejected', 'cancelled'].includes(result.status) && order.status !== 'rejected') {
      // استرجاع الرصيد إذا كان الدفع بالمحفظة
      if (order.payment_method === 'wallet' && parseFloat(order.total_price) > 0 && order.payment_status === 'paid') {
        try {
          const pool = getPool();
          const [refundResult] = await pool.query(
            "UPDATE orders SET payment_status = 'refunded' WHERE id = ? AND site_key = ? AND payment_status = 'paid'",
            [id, site_key]
          );
          if (refundResult.affectedRows > 0) {
            await Customer.updateWallet(order.customer_id, site_key, parseFloat(order.total_price));
            await Payment.create({
              site_key, customer_id: order.customer_id, order_id: order.id,
              type: 'refund', amount: parseFloat(order.total_price),
              payment_method: 'wallet', status: 'completed',
              description: `استرجاع تلقائي: طلب #${order.order_number} (${result.statusLabel})`
            });
            console.log(`💰 checkExternalOrderStatus: استرجاع $${order.total_price} للزبون ${order.customer_id}`);
          }
        } catch (refundErr) {
          console.error(`❌ فشل استرجاع الرصيد لطلب #${order.order_number}:`, refundErr.message);
        }
      }

      await Notification.create({
        site_key,
        recipient_type: 'customer',
        recipient_id: order.customer_id,
        title: 'طلب مرفوض ❌',
        message: `طلبك #${order.order_number}: ${result.statusLabel}${result.message ? ' - ' + result.message : ''}${order.payment_method === 'wallet' ? '. تم استرجاع الرصيد لمحفظتك.' : ''}`,
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
    if (error instanceof ImeiCheckError) {
      return res.status(400).json({
        error: `خطأ من IMEI Check: ${error.message}`
      });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء فحص حالة الطلب' });
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
    const dhruTypes = ['dhru-fusion', 'sd-unlocker', 'unlock-world'];

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
          if (!apiKey) {
            results.push({ orderId: order.id, status: 'skipped', reason: 'invalid api key' });
            continue;
          }

          // ─── IMEI Check ───
          if (source.type === 'imeicheck') {
            const phpBaseUrl = 'https://alpha.imeicheck.com/api/php-api';
            sourceCache[srcId] = { client: new ImeiCheckClient({ apiKey, baseUrl: phpBaseUrl }), type: 'imeicheck' };
          }
          // ─── DHRU Fusion وأشباهه ───
          else if (dhruTypes.includes(source.type)) {
            sourceCache[srcId] = { client: new DhruFusionClient({ baseUrl: source.url, username: source.username || '', apiAccessKey: apiKey }), type: 'dhru' };
          } else {
            results.push({ orderId: order.id, status: 'skipped', reason: 'unsupported source type' });
            continue;
          }
        }

        const { client, type: clientType } = sourceCache[srcId];
        let result;

        if (clientType === 'imeicheck') {
          const historyResult = await client.getOrderHistory(order.external_reference_id);
          result = {
            status: historyResult.status,
            statusLabel: historyResult.statusLabel,
            comments: historyResult.result || null,
            message: historyResult.result || null,
            fullResponse: historyResult.result || historyResult.statusLabel || '',
          };
        } else {
          result = await client.getOrderStatus(order.external_reference_id);
        }

        const statusMapping = {
          'completed': 'completed',
          'waiting': 'processing',
          'pending': 'processing',
          'rejected': 'rejected',
          'cancelled': 'rejected'
        };

        const newStatus = statusMapping[result.status] || order.status;
        if (newStatus !== order.status) {
          // حفظ المحتوى كنص عادي (متوافق مع الكرون والفرونتند)
          const responseText = result.fullResponse || result.comments || result.message || result.statusLabel || '';
          await Order.updateStatus(order.id, site_key, newStatus, responseText);

          // استرجاع الرصيد تلقائياً عند الرفض
          if (newStatus === 'rejected' && order.payment_method === 'wallet' && parseFloat(order.total_price) > 0 && order.payment_status === 'paid') {
            try {
              const pool = getPool();
              const [refundResult] = await pool.query(
                "UPDATE orders SET payment_status = 'refunded' WHERE id = ? AND site_key = ? AND payment_status = 'paid'",
                [order.id, site_key]
              );
              if (refundResult.affectedRows > 0) {
                await Customer.updateWallet(order.customer_id, site_key, parseFloat(order.total_price));
                await Payment.create({
                  site_key, customer_id: order.customer_id, order_id: order.id,
                  type: 'refund', amount: parseFloat(order.total_price),
                  payment_method: 'wallet', status: 'completed',
                  description: `استرجاع تلقائي: طلب #${order.order_number} (${result.statusLabel})`
                });
                console.log(`💰 bulkCheck: استرجاع $${order.total_price} للزبون ${order.customer_id}`);
              }
            } catch (refundErr) {
              console.error(`❌ فشل استرجاع الرصيد لطلب #${order.order_number}:`, refundErr.message);
            }
          }
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
  cancelCustomerOrder,
  updateOrderStatus,
  getOrderStats,
  placeExternalOrder,
  checkExternalOrderStatus,
  bulkCheckExternalOrders
};
