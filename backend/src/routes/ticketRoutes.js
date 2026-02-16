const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  createTicket,
  getTicketMessages,
  replyToTicket,
  updateTicketStatus
} = require('../controllers/ticketController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// جلب التذاكر
router.get('/', authenticateToken, requireRole('admin', 'user'), getAllTickets);

// إنشاء تذكرة
router.post('/', authenticateToken, requireRole('admin', 'user', 'customer'), createTicket);

// جلب رسائل تذكرة
router.get('/:id/messages', authenticateToken, requireRole('admin', 'user', 'customer'), getTicketMessages);

// رد على تذكرة
router.post('/:id/reply', authenticateToken, requireRole('admin', 'user', 'customer'), replyToTicket);

// تحديث حالة تذكرة
router.patch('/:id/status', authenticateToken, requireRole('admin', 'user'), updateTicketStatus);

module.exports = router;
