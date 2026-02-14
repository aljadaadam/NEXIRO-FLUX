const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  createTicket,
  getTicketMessages,
  replyToTicket,
  updateTicketStatus
} = require('../controllers/ticketController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateSite } = require('../middlewares/siteValidationMiddleware');

router.use(validateSite);

// جلب التذاكر
router.get('/', authenticateToken, getAllTickets);

// إنشاء تذكرة
router.post('/', authenticateToken, createTicket);

// جلب رسائل تذكرة
router.get('/:id/messages', authenticateToken, getTicketMessages);

// رد على تذكرة
router.post('/:id/reply', authenticateToken, replyToTicket);

// تحديث حالة تذكرة
router.patch('/:id/status', authenticateToken, updateTicketStatus);

module.exports = router;
