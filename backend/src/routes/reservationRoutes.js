const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createReservation,
  getReservations,
  updateReservationStatus,
  deleteReservation,
} = require('../controllers/reservationController');
const { authenticateToken, requirePlatformAdmin } = require('../middlewares/authMiddleware');

// ─── Rate limiter لمنع السبام ───
const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5,
  message: {
    error: 'عدد كبير من الطلبات. حاول لاحقاً',
    errorEn: 'Too many requests. Try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public: إنشاء حجز (بدون مصادقة) ───
router.post('/', reservationLimiter, createReservation);

// ─── Admin: جلب الحجوزات ───
router.get('/', authenticateToken, requirePlatformAdmin, getReservations);

// ─── Admin: تحديث حالة حجز ───
router.patch('/:id/status', authenticateToken, requirePlatformAdmin, updateReservationStatus);

// ─── Admin: حذف حجز ───
router.delete('/:id', authenticateToken, requirePlatformAdmin, deleteReservation);

module.exports = router;
