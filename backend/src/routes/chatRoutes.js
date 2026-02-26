const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { validateSite } = require('../middlewares/siteValidationMiddleware');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');

// Rate limiter for public chat endpoints — prevent spam
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { error: 'طلبات كثيرة جداً، حاول لاحقاً' },
});

/* ─── نقاط عامة (الزبون) — يجب أن يكون siteKey محدداً ─── */
const requireSiteKey = (req, res, next) => {
  if (!req.siteKey) {
    return res.status(400).json({ error: 'لم يتم تحديد الموقع' });
  }
  next();
};
router.post('/public/start', chatLimiter, requireSiteKey, chatController.startConversation);
router.post('/public/send', chatLimiter, requireSiteKey, chatController.sendCustomerMessage);
router.get('/public/messages', chatLimiter, requireSiteKey, chatController.getCustomerMessages);

/* ─── نقاط إدارية ─── */
router.use(validateSite);
router.use(authenticateToken);

router.get('/', requireRole('admin'), chatController.getConversations);
router.get('/unread', requireRole('admin'), chatController.getUnreadCount);
router.get('/:conversationId/messages', requireRole('admin'), chatController.getConversationMessages);
router.post('/:conversationId/send', requireRole('admin'), chatController.sendAdminMessage);
router.patch('/:conversationId/close', requireRole('admin'), chatController.closeConversation);

module.exports = router;
