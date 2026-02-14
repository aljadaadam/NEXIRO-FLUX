const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// جلب جميع التذاكر
async function getAllTickets(req, res) {
  try {
    const { site_key } = req.user;
    const { page, limit, status, priority } = req.query;

    const tickets = await Ticket.findBySiteKey(site_key, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      status, priority
    });

    const stats = await Ticket.getStats(site_key);
    res.json({ tickets, stats });
  } catch (error) {
    console.error('Error in getAllTickets:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التذاكر' });
  }
}

// إنشاء تذكرة
async function createTicket(req, res) {
  try {
    const { site_key } = req.user;
    const { customer_id, subject, message, priority, category } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'الموضوع والرسالة مطلوبان' });
    }

    const ticket = await Ticket.create({ site_key, customer_id, subject, priority, category });

    // إضافة الرسالة الأولى
    await Ticket.addMessage({
      ticket_id: ticket.id,
      sender_type: customer_id ? 'customer' : 'admin',
      sender_id: customer_id || req.user.id,
      message
    });

    // إشعار للأدمن
    await Notification.create({
      site_key, recipient_type: 'admin',
      title: 'تذكرة دعم جديدة',
      message: `تذكرة جديدة #${ticket.ticket_number}: ${subject}`,
      type: 'info', link: `/tickets/${ticket.id}`
    });

    res.status(201).json({ message: 'تم إنشاء التذكرة', ticket });
  } catch (error) {
    console.error('Error in createTicket:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء التذكرة' });
  }
}

// جلب رسائل تذكرة
async function getTicketMessages(req, res) {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket || ticket.site_key !== req.user.site_key) {
      return res.status(404).json({ error: 'التذكرة غير موجودة' });
    }

    const messages = await Ticket.getMessages(id);
    res.json({ ticket, messages });
  } catch (error) {
    console.error('Error in getTicketMessages:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// إضافة رد على تذكرة
async function replyToTicket(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { message, sender_type } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'الرسالة مطلوبة' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket || ticket.site_key !== site_key) {
      return res.status(404).json({ error: 'التذكرة غير موجودة' });
    }

    const reply = await Ticket.addMessage({
      ticket_id: id,
      sender_type: sender_type || 'admin',
      sender_id: req.user.id,
      message
    });

    // تحديث الحالة
    if (sender_type === 'admin' || !sender_type) {
      await Ticket.updateStatus(id, site_key, 'waiting');
    }

    // إشعار
    if (ticket.customer_id && (sender_type === 'admin' || !sender_type)) {
      await Notification.create({
        site_key, recipient_type: 'customer', recipient_id: ticket.customer_id,
        title: 'رد على تذكرتك',
        message: `تم الرد على تذكرة #${ticket.ticket_number}`,
        type: 'info'
      });
    }

    res.json({ message: 'تم إضافة الرد', reply });
  } catch (error) {
    console.error('Error in replyToTicket:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

// تحديث حالة التذكرة
async function updateTicketStatus(req, res) {
  try {
    const { site_key } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const success = await Ticket.updateStatus(id, site_key, status);
    if (!success) {
      return res.status(404).json({ error: 'التذكرة غير موجودة' });
    }

    res.json({ message: 'تم تحديث حالة التذكرة' });
  } catch (error) {
    console.error('Error in updateTicketStatus:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
}

module.exports = {
  getAllTickets,
  createTicket,
  getTicketMessages,
  replyToTicket,
  updateTicketStatus
};
