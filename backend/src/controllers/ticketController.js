const Ticket = require('../models/Ticket');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const emailService = require('../services/email');

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

    // IDOR fix: customers can only create tickets for themselves
    const safeCustomerId = (req.user.role === 'customer') ? req.user.id : customer_id;

    const ticket = await Ticket.create({ site_key, customer_id: safeCustomerId, subject, priority, category });

    // إضافة الرسالة الأولى
    await Ticket.addMessage({
      ticket_id: ticket.id,
      sender_type: safeCustomerId ? 'customer' : 'admin',
      sender_id: safeCustomerId || req.user.id,
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

    // بريد تنبيه بالتذكرة الجديدة
    if (safeCustomerId) {
      try {
        const cust = await Customer.findById(safeCustomerId);
        emailService.sendNewTicketAlert({
          to: cust?.email, ticketId: ticket.ticket_number,
          subject, customerName: cust?.name, siteKey: site_key
        }).catch(() => {});
      } catch (e) { /* ignore */ }
    }
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

    // IDOR fix: customers can only see their own tickets
    if (req.user.role === 'customer' && ticket.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'لا يمكنك عرض هذه التذكرة' });
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

    // IDOR fix: customers can only reply to their own tickets
    if (req.user.role === 'customer' && ticket.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'لا يمكنك الرد على هذه التذكرة' });
    }

    // Fix sender_type spoofing: enforce based on actual role
    const actualSenderType = (req.user.role === 'customer') ? 'customer' : 'admin';

    const reply = await Ticket.addMessage({
      ticket_id: id,
      sender_type: actualSenderType,
      sender_id: req.user.id,
      message
    });

    // تحديث الحالة
    if (actualSenderType === 'admin') {
      await Ticket.updateStatus(id, site_key, 'waiting');
    }

    // إشعار
    if (ticket.customer_id && actualSenderType === 'admin') {
      await Notification.create({
        site_key, recipient_type: 'customer', recipient_id: ticket.customer_id,
        title: 'رد على تذكرتك',
        message: `تم الرد على تذكرة #${ticket.ticket_number}`,
        type: 'info'
      });

      // بريد بالرد
      try {
        const cust = await Customer.findById(ticket.customer_id);
        if (cust?.email) {
          emailService.sendTicketReply({
            to: cust.email, name: cust.name,
            ticketId: ticket.ticket_number, message,
            replierName: 'فريق الدعم', siteKey: site_key
          }).catch(() => {});
        }
      } catch (e) { /* ignore */ }
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

    // بريد إغلاق التذكرة
    if (status === 'closed') {
      try {
        const ticket = await Ticket.findById(id);
        if (ticket?.customer_id) {
          const cust = await Customer.findById(ticket.customer_id);
          if (cust?.email) {
            emailService.sendTicketClosed({
              to: cust.email, name: cust.name,
              ticketId: ticket.ticket_number, siteKey: site_key
            }).catch(() => {});
          }
        }
      } catch (e) { /* ignore */ }
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
