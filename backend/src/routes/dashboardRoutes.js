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
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── إحصائيات وبيانات المنصة الرئيسية (بدون validateSite — عالمي) ───
router.get('/platform-stats', authenticateToken, requireRole('admin', 'user'), getPlatformStats);
router.get('/platform-payments', authenticateToken, requireRole('admin', 'user'), getPlatformPayments);
router.patch('/platform-payments/:id/status', authenticateToken, requireRole('admin', 'user'), updatePlatformPaymentStatus);
router.get('/platform-tickets', authenticateToken, requireRole('admin', 'user'), getPlatformTickets);
router.get('/platform-tickets/:id/messages', authenticateToken, requireRole('admin', 'user'), getPlatformTicketMessages);
router.post('/platform-tickets/:id/reply', authenticateToken, requireRole('admin', 'user'), replyPlatformTicket);
router.patch('/platform-tickets/:id/status', authenticateToken, requireRole('admin', 'user'), updatePlatformTicketStatus);
router.get('/platform-users', authenticateToken, requireRole('admin', 'user'), getPlatformUsers);
router.get('/platform-sites', authenticateToken, requireRole('admin', 'user'), getPlatformSites);

// ─── بيانات أدمن الموقع (بعد validateSite — مفلتر بـ site_key) ───
router.use(validateSite);

// جلب إحصائيات لوحة التحكم (للأدمن فقط)
router.get('/stats', authenticateToken, requireRole('admin', 'user'), getDashboardStats);

// جلب آخر النشاطات
router.get('/activities', authenticateToken, requireRole('admin', 'user'), getRecentActivities);

module.exports = router;