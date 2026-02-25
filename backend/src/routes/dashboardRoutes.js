const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentActivities,
  getPlatformStats,
  getPlatformPayments,
  updatePlatformPaymentStatus,
  getPlatformTickets,
  getPlatformTicketMessages,
  replyPlatformTicket,
  updatePlatformTicketStatus,
  getPlatformUsers,
  getPlatformSites,
} = require('../controllers/dashboardController');
const { authenticateToken, requireRole, requirePlatformAdmin } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── إحصائيات وبيانات المنصة الرئيسية (بدون validateSite — أدمن المنصة فقط) ───
router.get('/platform-stats', authenticateToken, requirePlatformAdmin, getPlatformStats);
router.get('/platform-payments', authenticateToken, requirePlatformAdmin, getPlatformPayments);
router.patch('/platform-payments/:id/status', authenticateToken, requirePlatformAdmin, updatePlatformPaymentStatus);
router.get('/platform-tickets', authenticateToken, requirePlatformAdmin, getPlatformTickets);
router.get('/platform-tickets/:id/messages', authenticateToken, requirePlatformAdmin, getPlatformTicketMessages);
router.post('/platform-tickets/:id/reply', authenticateToken, requirePlatformAdmin, replyPlatformTicket);
router.patch('/platform-tickets/:id/status', authenticateToken, requirePlatformAdmin, updatePlatformTicketStatus);
router.get('/platform-users', authenticateToken, requirePlatformAdmin, getPlatformUsers);
router.get('/platform-sites', authenticateToken, requirePlatformAdmin, getPlatformSites);

// ─── بيانات أدمن الموقع (بعد validateSite — مفلتر بـ site_key) ───
router.use(validateSite);

// جلب إحصائيات لوحة التحكم (للأدمن فقط)
router.get('/stats', authenticateToken, requireRole('admin', 'user'), getDashboardStats);

// جلب آخر النشاطات
router.get('/activities', authenticateToken, requireRole('admin', 'user'), getRecentActivities);

module.exports = router;