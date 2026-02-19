const express = require('express');
const router = express.Router();
const { validateSite } = require('../middlewares/siteValidationMiddleware');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');

/* ─── نقاط عامة (الزبون) ─── */
router.post('/public/start', chatController.startConversation);
router.post('/public/send', chatController.sendCustomerMessage);
router.get('/public/messages', chatController.getCustomerMessages);

/* ─── نقاط إدارية ─── */
router.use(validateSite);
router.use(authenticateToken);

router.get('/', requireRole('admin'), chatController.getConversations);
router.get('/unread', requireRole('admin'), chatController.getUnreadCount);
router.get('/:conversationId/messages', requireRole('admin'), chatController.getConversationMessages);
router.post('/:conversationId/send', requireRole('admin'), chatController.sendAdminMessage);
router.patch('/:conversationId/close', requireRole('admin'), chatController.closeConversation);

module.exports = router;
