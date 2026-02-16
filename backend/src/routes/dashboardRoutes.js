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
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

// ─── إحصائيات وبيانات المنصة الرئيسية (بدون validateSite — عالمي) ───
router.get('/platform-stats', authenticateToken, getPlatformStats);
router.get('/platform-payments', authenticateToken, getPlatformPayments);
router.patch('/platform-payments/:id/status', authenticateToken, updatePlatformPaymentStatus);
router.get('/platform-tickets', authenticateToken, getPlatformTickets);
router.get('/platform-tickets/:id/messages', authenticateToken, getPlatformTicketMessages);
router.post('/platform-tickets/:id/reply', authenticateToken, replyPlatformTicket);
router.patch('/platform-tickets/:id/status', authenticateToken, updatePlatformTicketStatus);
router.get('/platform-users', authenticateToken, getPlatformUsers);
router.get('/platform-sites', authenticateToken, getPlatformSites);

// ─── بيانات أدمن الموقع (بعد validateSite — مفلتر بـ site_key) ───
router.use(validateSite);

// جلب إحصائيات لوحة التحكم (للأدمن فقط)
router.get('/stats', authenticateToken, getDashboardStats);

// جلب آخر النشاطات
router.get('/activities', authenticateToken, getRecentActivities);

module.exports = router;