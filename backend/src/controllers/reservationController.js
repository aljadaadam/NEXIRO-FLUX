const Reservation = require('../models/Reservation');

// ─── إنشاء حجز (عام — بدون مصادقة) ───
async function createReservation(req, res) {
  try {
    const { name, email, phone, template_id, template_name, plan, message } = req.body;

    // التحقق من البيانات المطلوبة
    if (!name || !email || !template_id || !template_name) {
      return res.status(400).json({
        error: 'الاسم والبريد الإلكتروني ومعلومات القالب مطلوبة',
        errorEn: 'Name, email and template info are required',
      });
    }

    // التحقق من تنسيق البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'تنسيق البريد الإلكتروني غير صحيح',
        errorEn: 'Invalid email format',
      });
    }

    // التحقق من حجز مكرر
    const isDuplicate = await Reservation.checkDuplicate(email, template_id);
    if (isDuplicate) {
      return res.status(429).json({
        error: 'لقد قمت بالحجز لهذا القالب مؤخراً. سنتواصل معك قريباً',
        errorEn: 'You have already reserved this template recently. We will contact you soon',
      });
    }

    // الحصول على IP
    const ip_address = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

    const reservation = await Reservation.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      template_id,
      template_name,
      plan: plan || 'monthly',
      message: message?.trim() || null,
      ip_address,
    });

    res.status(201).json({
      message: 'تم الحجز بنجاح! سنتواصل معك قريباً',
      messageEn: 'Reservation successful! We will contact you soon',
      reservation: { id: reservation.id },
    });
  } catch (error) {
    console.error('Error in createReservation:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء إنشاء الحجز',
      errorEn: 'An error occurred while creating the reservation',
    });
  }
}

// ─── جلب جميع الحجوزات (أدمن المنصة فقط) ───
async function getReservations(req, res) {
  try {
    const { page = 1, limit = 50, status } = req.query;

    const reservations = await Reservation.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      status,
    });

    const stats = await Reservation.getStats();

    res.json({ reservations, stats });
  } catch (error) {
    console.error('Error in getReservations:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الحجوزات' });
  }
}

// ─── تحديث حالة الحجز (أدمن المنصة فقط) ───
async function updateReservationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['pending', 'contacted', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }

    const success = await Reservation.updateStatus(parseInt(id), status, admin_notes);
    if (!success) {
      return res.status(404).json({ error: 'الحجز غير موجود' });
    }

    const updated = await Reservation.findById(parseInt(id));
    res.json({ message: 'تم تحديث حالة الحجز', reservation: updated });
  } catch (error) {
    console.error('Error in updateReservationStatus:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الحجز' });
  }
}

// ─── حذف حجز (أدمن المنصة فقط) ───
async function deleteReservation(req, res) {
  try {
    const { id } = req.params;
    const success = await Reservation.delete(parseInt(id));
    if (!success) {
      return res.status(404).json({ error: 'الحجز غير موجود' });
    }
    res.json({ message: 'تم حذف الحجز' });
  } catch (error) {
    console.error('Error in deleteReservation:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الحجز' });
  }
}

module.exports = {
  createReservation,
  getReservations,
  updateReservationStatus,
  deleteReservation,
};
