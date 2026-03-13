// ─── Email Service ───
// Handles all email sending for NEXIRO-FLUX platform
// Uses nodemailer with SMTP (per-site or global config)
// Auto-fetches per-site branding (store name, logo, colors)

const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = require('../config/env');
const templates = require('./emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
    this._brandingCache = new Map();
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

  // ─── Fetch site branding from Customization table ───
  async _getBranding(siteKey) {
    if (!siteKey) return {};

    // Check cache (5 min TTL)
    const cached = this._brandingCache.get(siteKey);
    if (cached && Date.now() - cached.ts < 300000) return cached.data;

    try {
      const Customization = require('../models/Customization');
      const custom = await Customization.findBySiteKey(siteKey);
      if (!custom) return {};
      const branding = {
        storeName: custom.store_name || null,
        logoUrl: custom.logo_url || null,
        primaryColor: custom.primary_color || '#7c3aed',
        secondaryColor: custom.secondary_color || null,
        supportEmail: custom.support_email || null,
        supportPhone: custom.support_phone || null,
        language: custom.store_language || 'ar',
      };
      this._brandingCache.set(siteKey, { data: branding, ts: Date.now() });
      return branding;
    } catch (err) {
      console.error('📧 Failed to fetch site branding:', err.message);
      return {};
    }
  }

  // ─── Fetch site SMTP settings from Site table or Customization table ───
  async _getSiteSettingsFromDB(siteKey) {
    if (!siteKey) return null;
    try {
      // 1) Check sites.settings.smtp first
      const Site = require('../models/Site');
      const site = await Site.findBySiteKey(siteKey);
      if (site?.settings) {
        const settings = typeof site.settings === 'string' ? JSON.parse(site.settings) : site.settings;
        if (settings?.smtp?.host && settings?.smtp?.user) return settings;
      }

      // 2) Fallback: check customizations table for SMTP fields
      const Customization = require('../models/Customization');
      const custom = await Customization.findBySiteKey(siteKey);
      if (custom?.smtp_host && custom?.smtp_user) {
        return {
          smtp: {
            host: custom.smtp_host,
            port: custom.smtp_port || 587,
            user: custom.smtp_user,
            pass: custom.smtp_pass,
            from: custom.smtp_user,
          }
        };
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  // ─── Resolve admin email for a site ───
  async _getAdminEmail(siteKey) {
    if (!siteKey) return null;
    try {
      const { getPool } = require('../config/db');
      const pool = getPool();
      const [rows] = await pool.query(
        "SELECT email FROM users WHERE site_key = ? AND role = 'admin' LIMIT 1",
        [siteKey]
      );
      return rows[0]?.email || null;
    } catch (err) {
      return null;
    }
  }

  // ─── Core send method ───
  async send({ to, subject, html, siteSettings = null, storeName = null }) {
    const transport = this._getSiteTransporter(siteSettings) || this.transporter;
    const fromEmail = siteSettings?.smtp?.from || SMTP_FROM;
    // إضافة اسم المتجر كـ display name في حقل الـ from
    const displayName = storeName || (siteSettings?.smtp?.from ? null : null);
    const from = displayName ? `"${displayName}" <${fromEmail}>` : fromEmail;

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

  async sendWelcomeAdmin({ to, name, siteName, siteKey }) {
    const branding = await this._getBranding(siteKey);
    const siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `مرحباً بك في ${branding.storeName || siteName || 'المتجر'} 🎉`,
      html: templates.welcomeAdmin({ name, siteName, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendWelcomeUser({ to, name, siteKey }) {
    const branding = await this._getBranding(siteKey);
    const siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `مرحباً بك في ${branding.storeName || 'المتجر'} 🎉`,
      html: templates.welcomeUser({ name, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendWelcomeCustomer({ to, name, storeName, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `مرحباً بك في ${branding.storeName || storeName || 'متجرنا'} 🎉`,
      html: templates.welcomeCustomer({ name, storeName: branding.storeName || storeName, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendPasswordReset({ to, name, resetLink, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'إعادة تعيين كلمة المرور 🔑',
      html: templates.passwordReset({ name, resetLink, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendEmailVerification({ to, name, code, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'تأكيد بريدك الإلكتروني ✉️',
      html: templates.emailVerification({ name, code, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendLoginAlert({ to, name, ip, device, time, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'تنبيه تسجيل دخول جديد 🔐',
      html: templates.loginAlert({ name, ip, device, time, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendAccountBlocked({ to, name, reason, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'تم تعليق حسابك ⚠️',
      html: templates.accountBlocked({ name, reason, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendAccountUnblocked({ to, name, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'تم إعادة تفعيل حسابك ✅',
      html: templates.accountUnblocked({ name, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  // ══════════════════════════════════════
  //  ORDER EMAILS
  // ══════════════════════════════════════

  async sendOrderConfirmation({ to, name, orderId, items, total, currency, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `تأكيد الطلب #${orderId} ✅`,
      html: templates.orderConfirmation({ name, orderId, items, total, currency, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendNewOrderAlert({ to, orderId, customerName, total, currency, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!to && siteKey) to = await this._getAdminEmail(siteKey);
    if (!to) return { sent: false, error: 'no admin email' };
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `🛒 طلب جديد #${orderId}`,
      html: templates.newOrderAlert({ orderId, customerName, total, currency, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendOrderStatusUpdate({ to, name, orderId, status, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
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
      html: templates.orderStatusUpdate({ name, orderId, status, statusLabel: statusLabels[status] || status, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  // ══════════════════════════════════════
  //  PAYMENT EMAILS
  // ══════════════════════════════════════

  async sendPaymentReceipt({ to, name, amount, currency, method, transactionId, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `إيصال الدفع — $${amount} ✅`,
      html: templates.paymentReceipt({ name, amount, currency, method, transactionId, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendPaymentFailed({ to, name, amount, currency, reason, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'فشل عملية الدفع ❌',
      html: templates.paymentFailed({ name, amount, currency, reason, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendPaymentInstructions({ to, name, method, amount, currency, details, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `تعليمات الدفع — ${method} 💳`,
      html: templates.paymentInstructions({ name, method, amount, currency, details, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendBankReceiptReview({ to, orderId, customerName, amount, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!to && siteKey) to = await this._getAdminEmail(siteKey);
    if (!to) return { sent: false, error: 'no admin email' };
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `📎 إيصال بنكي بحاجة مراجعة — طلب #${orderId}`,
      html: templates.bankReceiptReview({ orderId, customerName, amount, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  // ══════════════════════════════════════
  //  TICKET EMAILS
  // ══════════════════════════════════════

  async sendNewTicketAlert({ to, ticketId, subject: ticketSubject, customerName, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `🎫 تذكرة دعم جديدة #${ticketId}`,
      html: templates.newTicket({ ticketId, ticketSubject, customerName, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendTicketReply({ to, name, ticketId, message, replierName, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `رد على تذكرة #${ticketId} 💬`,
      html: templates.ticketReply({ name, ticketId, message, replierName, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendTicketClosed({ to, name, ticketId, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `تذكرة #${ticketId} — تم الإغلاق ✅`,
      html: templates.ticketClosed({ name, ticketId, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  // ══════════════════════════════════════
  //  SITE / SUBSCRIPTION EMAILS
  // ══════════════════════════════════════

  async sendSiteCreated({ to, name, siteName, siteKey, domain, plan }) {
    const branding = await this._getBranding(siteKey);
    const siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `تم إنشاء موقعك "${branding.storeName || siteName}" بنجاح 🚀`,
      html: templates.siteCreated({ name, siteName, siteKey, domain, plan, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendTrialStarted({ to, name, siteName, trialDays, siteKey }) {
    const branding = await this._getBranding(siteKey);
    const siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `بدأت الفترة التجريبية — ${trialDays} يوم 🕐`,
      html: templates.trialStarted({ name, siteName, trialDays, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendTrialExpiring({ to, name, siteName, daysLeft, siteKey }) {
    const branding = await this._getBranding(siteKey);
    const siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `⚠️ الفترة التجريبية تنتهي خلال ${daysLeft} يوم`,
      html: templates.trialExpiring({ name, siteName, daysLeft, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendTrialExpired({ to, name, siteName, siteKey }) {
    const branding = await this._getBranding(siteKey);
    const siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'انتهت الفترة التجريبية ⏰',
      html: templates.trialExpired({ name, siteName, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendSubscriptionRenewed({ to, name, plan, nextBilling, siteKey }) {
    const branding = await this._getBranding(siteKey);
    const siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'تم تجديد اشتراكك ✅',
      html: templates.subscriptionRenewed({ name, plan, nextBilling, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendSubscriptionCancelled({ to, name, expiresAt, siteKey }) {
    const branding = await this._getBranding(siteKey);
    const siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: 'تم إلغاء اشتراكك',
      html: templates.subscriptionCancelled({ name, expiresAt, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  // ══════════════════════════════════════
  //  WALLET EMAILS
  // ══════════════════════════════════════

  async sendWalletChargeRequest({ to, customerName, amount, currency, method, referenceId, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!to && siteKey) to = await this._getAdminEmail(siteKey);
    if (!to) return { sent: false, error: 'no admin email' };
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `💰 طلب شحن محفظة — ${customerName || 'عميل'}`,
      html: templates.walletChargeRequest({ customerName, amount, currency, method, referenceId, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }

  async sendWalletUpdated({ to, name, oldBalance, newBalance, currency, siteSettings, siteKey }) {
    const branding = await this._getBranding(siteKey);
    if (!siteSettings && siteKey) siteSettings = await this._getSiteSettingsFromDB(siteKey);
    return this.send({
      to,
      subject: `تحديث رصيد المحفظة 💰`,
      html: templates.walletUpdated({ name, oldBalance, newBalance, currency, branding }),
      siteSettings,
      storeName: branding.storeName,
    });
  }
}

module.exports = new EmailService();
