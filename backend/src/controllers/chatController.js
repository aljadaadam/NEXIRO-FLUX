const ChatMessage = require('../models/ChatMessage');

/* ════════════════════════════════════════
   نقاط النهاية العامة (الزبون)
   ════════════════════════════════════════ */

// بدء أو استئناف محادثة
exports.startConversation = async (req, res) => {
  try {
    const site_key = req.siteKey;
    const { conversation_id, customer_name, customer_email } = req.body;
    if (!conversation_id) return res.status(400).json({ error: 'conversation_id مطلوب' });
    const conv = await ChatMessage.getOrCreateConversation(site_key, conversation_id, customer_name, customer_email);
    res.json({ conversation: conv });
  } catch (err) {
    console.error('startConversation error:', err);
    res.status(500).json({ error: 'خطأ في بدء المحادثة' });
  }
};

// إرسال رسالة من الزبون
exports.sendCustomerMessage = async (req, res) => {
  try {
    const site_key = req.siteKey;
    const { conversation_id, message, customer_name, customer_email } = req.body;
    if (!conversation_id || !message?.trim()) return res.status(400).json({ error: 'بيانات ناقصة' });
    // Security: limit message length to prevent abuse
    if (message.length > 5000) return res.status(400).json({ error: 'الرسالة طويلة جداً (حد 5000 حرف)' });
    // تأكد من وجود المحادثة
    await ChatMessage.getOrCreateConversation(site_key, conversation_id, customer_name, customer_email);
    const msgId = await ChatMessage.addMessage(site_key, conversation_id, 'customer', message.trim());
    res.json({ success: true, messageId: msgId });
  } catch (err) {
    console.error('sendCustomerMessage error:', err);
    res.status(500).json({ error: 'خطأ في إرسال الرسالة' });
  }
};

// جلب رسائل المحادثة (polling)
exports.getCustomerMessages = async (req, res) => {
  try {
    const site_key = req.siteKey;
    const { conversation_id, after } = req.query;
    if (!conversation_id) return res.status(400).json({ error: 'conversation_id مطلوب' });
    const messages = await ChatMessage.getMessages(site_key, conversation_id, parseInt(after) || 0);
    // تحديث حالة القراءة – الزبون قرأ رسائل الأدمن
    if (messages.length) {
      await ChatMessage.markRead(site_key, conversation_id, 'customer');
    }
    res.json({ messages });
  } catch (err) {
    console.error('getCustomerMessages error:', err);
    res.status(500).json({ error: 'خطأ في جلب الرسائل' });
  }
};

/* ════════════════════════════════════════
   نقاط النهاية الإدارية (الأدمن)
   ════════════════════════════════════════ */

// جلب كل المحادثات
exports.getConversations = async (req, res) => {
  try {
    const { site_key } = req.user;
    const conversations = await ChatMessage.getConversationsBySiteKey(site_key);
    const totalUnread = await ChatMessage.getTotalUnread(site_key);
    res.json({ conversations, totalUnread });
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ error: 'خطأ في جلب المحادثات' });
  }
};

// جلب رسائل محادثة معيّنة
exports.getConversationMessages = async (req, res) => {
  try {
    const { site_key } = req.user;
    const { conversationId } = req.params;
    const after = parseInt(req.query.after) || 0;

    const messages = after > 0
      ? await ChatMessage.getMessages(site_key, conversationId, after)
      : await ChatMessage.getAllMessages(site_key, conversationId);

    // الأدمن قرأ رسائل الزبون
    await ChatMessage.markRead(site_key, conversationId, 'admin');
    res.json({ messages });
  } catch (err) {
    console.error('getConversationMessages error:', err);
    res.status(500).json({ error: 'خطأ في جلب الرسائل' });
  }
};

// إرسال رد من الأدمن
exports.sendAdminMessage = async (req, res) => {
  try {
    const { site_key } = req.user;
    const { conversationId } = req.params;
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'الرسالة مطلوبة' });
    const msgId = await ChatMessage.addMessage(site_key, conversationId, 'admin', message.trim());
    res.json({ success: true, messageId: msgId });
  } catch (err) {
    console.error('sendAdminMessage error:', err);
    res.status(500).json({ error: 'خطأ في إرسال الرد' });
  }
};

// إغلاق محادثة
exports.closeConversation = async (req, res) => {
  try {
    const { site_key } = req.user;
    const { conversationId } = req.params;
    await ChatMessage.closeConversation(site_key, conversationId);
    res.json({ success: true });
  } catch (err) {
    console.error('closeConversation error:', err);
    res.status(500).json({ error: 'خطأ في إغلاق المحادثة' });
  }
};

// عدد الرسائل غير المقروءة
exports.getUnreadCount = async (req, res) => {
  try {
    const { site_key } = req.user;
    const total = await ChatMessage.getTotalUnread(site_key);
    res.json({ unread: total });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    res.status(500).json({ error: 'خطأ' });
  }
};
