// ─── Email Service ───
// Handles all email sending for NEXIRO-FLUX platform
// Uses nodemailer with SMTP (per-site or global config)

const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = require('../config/env');
const templates = require('./emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
    this._initGlobal();
  }

  // ─── Initialize global SMTP transporter ───
  _initGlobal() {
    if (SMTP_HOST && SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      console.log('📧 Email service initialized (global SMTP)');
    } else {
      console.log('⚠️ Email service: No SMTP configured — emails will be logged only');
    }
  }

  // ─── Create transporter from site-level SMTP settings ───
  _getSiteTransporter(siteSettings) {
    if (!siteSettings?.smtp?.host || !siteSettings?.smtp?.user) return null;
    const smtp = siteSettings.smtp;
    return nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port || 587),
      secure: Number(smtp.port) === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
  }

  // ─── Core send method ───
  async send({ to, subject, html, siteSettings = null }) {
    const transport = this._getSiteTransporter(siteSettings) || this.transporter;
    const from = siteSettings?.smtp?.from || SMTP_FROM;

    if (!transport) {
      console.log(`📧 [LOG ONLY] To: ${to} | Subject: ${subject}`);
      console.log(`📧 HTML preview (first 200 chars): ${html?.substring(0, 200)}...`);
      return { logged: true, to, subject };
    }

    try {
      const info = await transport.sendMail({ from, to, subject, html });
      console.log(`📧 Email sent to ${to} — ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      console.error(`📧 Email FAILED to ${to}:`, error.message);
      return { sent: false, error: error.message };
    }
  }

  // ══════════════════════════════════════
  //  AUTH EMAILS
  // ══════════════════════════════════════

  async sendWelcomeAdmin({ to, name, siteName }) {
    return this.send({
      to,
      subject: `مرحباً بك في ${siteName || 'NEXIRO-FLUX'} 🎉`,
      html: templates.welcomeAdmin({ name, siteName }),
    });
  }

  async sendWelcomeCustomer({ to, name, storeName, siteSettings }) {
    return this.send({
      to,
      subject: `مرحباً بك في ${storeName || 'متجرنا'} 🎉`,
      html: templates.welcomeCustomer({ name, storeName }),
      siteSettings,
    });
  }

  async sendPasswordReset({ to, name, resetLink, siteSettings }) {
    return this.send({
      to,
      subject: 'إعادة تعيين كلمة المرور 🔑',
      html: templates.passwordReset({ name, resetLink }),
      siteSettings,
    });
  }

  async sendEmailVerification({ to, name, code, siteSettings }) {
    return this.send({
      to,
      subject: 'تأكيد بريدك الإلكتروني ✉️',
      html: templates.emailVerification({ name, code }),
      siteSettings,
    });
  }

  async sendLoginAlert({ to, name, ip, device, time, siteSettings }) {
    return this.send({
      to,
      subject: 'تنبيه تسجيل دخول جديد 🔐',
      html: templates.loginAlert({ name, ip, device, time }),
      siteSettings,
    });
  }

  async sendAccountBlocked({ to, name, reason, siteSettings }) {
    return this.send({
      to,
      subject: 'تم تعليق حسابك ⚠️',
      html: templates.accountBlocked({ name, reason }),
      siteSettings,
    });
  }

  async sendAccountUnblocked({ to, name, siteSettings }) {
    return this.send({
      to,
      subject: 'تم إعادة تفعيل حسابك ✅',
      html: templates.accountUnblocked({ name }),
      siteSettings,
    });
  }

  // ══════════════════════════════════════
  //  ORDER EMAILS
  // ══════════════════════════════════════

  async sendOrderConfirmation({ to, name, orderId, items, total, currency, siteSettings }) {
    return this.send({
      to,
      subject: `تأكيد الطلب #${orderId} ✅`,
      html: templates.orderConfirmation({ name, orderId, items, total, currency }),
      siteSettings,
    });
  }

  async sendNewOrderAlert({ to, orderId, customerName, total, currency, siteSettings }) {
    return this.send({
      to,
      subject: `🛒 طلب جديد #${orderId}`,
      html: templates.newOrderAlert({ orderId, customerName, total, currency }),
      siteSettings,
    });
  }

  async sendOrderStatusUpdate({ to, name, orderId, status, siteSettings }) {
    const statusLabels = {
      processing: 'جاري المعالجة',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      refunded: 'مسترجع',
      shipped: 'تم الشحن',
    };
    return this.send({
      to,
      subject: `تحديث الطلب #${orderId} — ${statusLabels[status] || status}`,
      html: templates.orderStatusUpdate({ name, orderId, status, statusLabel: statusLabels[status] || status }),
      siteSettings,
    });
  }

  // ══════════════════════════════════════
  //  PAYMENT EMAILS
  // ══════════════════════════════════════

  async sendPaymentReceipt({ to, name, amount, currency, method, transactionId, siteSettings }) {
    return this.send({
      to,
      subject: `إيصال الدفع — $${amount} ✅`,
      html: templates.paymentReceipt({ name, amount, currency, method, transactionId }),
      siteSettings,
    });
  }

  async sendPaymentFailed({ to, name, amount, currency, reason, siteSettings }) {
    return this.send({
      to,
      subject: 'فشل عملية الدفع ❌',
      html: templates.paymentFailed({ name, amount, currency, reason }),
      siteSettings,
    });
  }

  async sendPaymentInstructions({ to, name, method, amount, currency, details, siteSettings }) {
    return this.send({
      to,
      subject: `تعليمات الدفع — ${method} 💳`,
      html: templates.paymentInstructions({ name, method, amount, currency, details }),
      siteSettings,
    });
  }

  async sendBankReceiptReview({ to, orderId, customerName, amount, siteSettings }) {
    return this.send({
      to,
      subject: `📎 إيصال بنكي بحاجة مراجعة — طلب #${orderId}`,
      html: templates.bankReceiptReview({ orderId, customerName, amount }),
      siteSettings,
    });
  }

  // ══════════════════════════════════════
  //  TICKET EMAILS
  // ══════════════════════════════════════

  async sendNewTicketAlert({ to, ticketId, subject: ticketSubject, customerName, siteSettings }) {
    return this.send({
      to,
      subject: `🎫 تذكرة دعم جديدة #${ticketId}`,
      html: templates.newTicket({ ticketId, ticketSubject, customerName }),
      siteSettings,
    });
  }

  async sendTicketReply({ to, name, ticketId, message, replierName, siteSettings }) {
    return this.send({
      to,
      subject: `رد على تذكرة #${ticketId} 💬`,
      html: templates.ticketReply({ name, ticketId, message, replierName }),
      siteSettings,
    });
  }

  async sendTicketClosed({ to, name, ticketId, siteSettings }) {
    return this.send({
      to,
      subject: `تذكرة #${ticketId} — تم الإغلاق ✅`,
      html: templates.ticketClosed({ name, ticketId }),
      siteSettings,
    });
  }

  // ══════════════════════════════════════
  //  SITE / SUBSCRIPTION EMAILS
  // ══════════════════════════════════════

  async sendSiteCreated({ to, name, siteName, siteKey, domain, plan }) {
    return this.send({
      to,
      subject: `تم إنشاء موقعك "${siteName}" بنجاح 🚀`,
      html: templates.siteCreated({ name, siteName, siteKey, domain, plan }),
    });
  }

  async sendTrialStarted({ to, name, siteName, trialDays }) {
    return this.send({
      to,
      subject: `بدأت الفترة التجريبية — ${trialDays} يوم 🕐`,
      html: templates.trialStarted({ name, siteName, trialDays }),
    });
  }

  async sendTrialExpiring({ to, name, siteName, daysLeft }) {
    return this.send({
      to,
      subject: `⚠️ الفترة التجريبية تنتهي خلال ${daysLeft} يوم`,
      html: templates.trialExpiring({ name, siteName, daysLeft }),
    });
  }

  async sendTrialExpired({ to, name, siteName }) {
    return this.send({
      to,
      subject: 'انتهت الفترة التجريبية ⏰',
      html: templates.trialExpired({ name, siteName }),
    });
  }

  async sendSubscriptionRenewed({ to, name, plan, nextBilling }) {
    return this.send({
      to,
      subject: 'تم تجديد اشتراكك ✅',
      html: templates.subscriptionRenewed({ name, plan, nextBilling }),
    });
  }

  async sendSubscriptionCancelled({ to, name, expiresAt }) {
    return this.send({
      to,
      subject: 'تم إلغاء اشتراكك',
      html: templates.subscriptionCancelled({ name, expiresAt }),
    });
  }

  // ══════════════════════════════════════
  //  WALLET EMAILS
  // ══════════════════════════════════════

  async sendWalletUpdated({ to, name, oldBalance, newBalance, currency, siteSettings }) {
    return this.send({
      to,
      subject: `تحديث رصيد المحفظة 💰`,
      html: templates.walletUpdated({ name, oldBalance, newBalance, currency }),
      siteSettings,
    });
  }
}

module.exports = new EmailService();
