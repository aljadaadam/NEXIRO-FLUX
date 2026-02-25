// ─── Email HTML Templates ───
// All email templates for NEXIRO-FLUX platform
// Per-site branding support (store name, logo, colors)
// Bilingual (Arabic primary + English fallback)
// Responsive HTML email design

// ═══════════════════════════════════
//  COLOR HELPERS
// ═══════════════════════════════════

function darkenHex(hex, amount = 20) {
  const c = (hex || '#7c3aed').replace('#', '');
  const r = Math.max(0, parseInt(c.substr(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(c.substr(2, 2), 16) - amount);
  const b = Math.max(0, parseInt(c.substr(4, 2), 16) - amount);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function lightenHex(hex, amount = 60) {
  const c = (hex || '#7c3aed').replace('#', '');
  const r = Math.min(255, parseInt(c.substr(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(c.substr(2, 2), 16) + amount);
  const b = Math.min(255, parseInt(c.substr(4, 2), 16) + amount);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
  const c = (hex || '#7c3aed').replace('#', '');
  return {
    r: parseInt(c.substr(0, 2), 16),
    g: parseInt(c.substr(2, 2), 16),
    b: parseInt(c.substr(4, 2), 16),
  };
}

// ═══════════════════════════════════
//  UI HELPERS FACTORY
// ═══════════════════════════════════

function createUI(primaryColor = '#7c3aed') {
  const darkColor = darkenHex(primaryColor);
  const lightColor = lightenHex(primaryColor);
  const rgb = hexToRgb(primaryColor);

  return {
    heading: (text) => `<h2 style="margin:0 0 16px;color:#fff;font-size:20px;font-weight:700;">${text}</h2>`,
    text: (text) => `<p style="margin:0 0 12px;color:#9ca3af;font-size:14px;line-height:1.7;">${text}</p>`,
    highlight: (text) => `<span style="color:${lightColor};font-weight:600;">${text}</span>`,
    button: (text, url) => `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,${primaryColor},${darkColor});color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:700;">${text}</a>
  </div>`,
    divider: () => `<div style="height:1px;background:rgba(255,255,255,0.05);margin:24px 0;"></div>`,
    infoRow: (label, value) => `<tr>
    <td style="padding:8px 12px;color:#6b7280;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.03);">${label}</td>
    <td style="padding:8px 12px;color:#e5e7eb;font-size:13px;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.03);">${value}</td>
  </tr>`,
    infoTable: (rows) => `<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin:16px 0;">
    ${rows}
  </table>`,
    badge: (text, color = primaryColor) => `<span style="display:inline-block;padding:4px 12px;background:${color}20;color:${color};border-radius:8px;font-size:12px;font-weight:700;">${text}</span>`,
    icon: (emoji) => `<div style="text-align:center;margin-bottom:20px;"><span style="font-size:48px;">${emoji}</span></div>`,
    accentBorder: () => `border-right:3px solid ${primaryColor};`,
    accentBg: () => `background:rgba(${rgb.r},${rgb.g},${rgb.b},0.05);border:1px solid rgba(${rgb.r},${rgb.g},${rgb.b},0.15);`,
  };
}

// ═══════════════════════════════════
//  BASE LAYOUT
// ═══════════════════════════════════

function baseLayout({ title, content, footer = '', branding = {} }) {
  const storeName = branding.storeName || 'المتجر';
  const logoUrl = branding.logoUrl || '';
  const primaryColor = branding.primaryColor || '#7c3aed';
  const gradientEnd = darkenHex(primaryColor);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111827;border-radius:16px;border:1px solid rgba(255,255,255,0.05);overflow:hidden;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,${primaryColor},${gradientEnd});padding:32px 40px;text-align:center;">
  ${logoUrl ? `<img src="${logoUrl}" alt="${storeName}" style="max-height:48px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;">` : ''}
  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${storeName}</h1>
  ${!branding.storeName ? '<p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">منصة بناء المواقع الاحترافية</p>' : ''}
</td></tr>

<!-- Content -->
<tr><td style="padding:40px;">
  ${content}
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
  ${footer || `<p style="margin:0;color:#6b7280;font-size:11px;">© ${new Date().getFullYear()} ${storeName}. جميع الحقوق محفوظة.</p>
  <p style="margin:6px 0 0;color:#4b5563;font-size:10px;">هذه رسالة تلقائية — لا ترد عليها مباشرة.</p>`}
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}


// ═══════════════════════════════════
//  AUTH TEMPLATES
// ═══════════════════════════════════

function welcomeAdmin({ name, siteName, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'مرحباً بك',
    branding,
    content: `
      ${ui.icon('🎉')}
      ${ui.heading(`مرحباً ${name || ''}!`)}
      ${ui.text(`تم إنشاء حسابك بنجاح على منصة ${ui.highlight(siteName || branding.storeName || 'المتجر')}.`)}
      ${ui.text('يمكنك الآن الوصول إلى لوحة التحكم وإدارة موقعك بالكامل:')}
      ${ui.text('• إضافة وتعديل المنتجات')}
      ${ui.text('• إدارة الطلبات والمدفوعات')}
      ${ui.text('• تخصيص مظهر المتجر')}
      ${ui.text('• متابعة الإحصائيات والتقارير')}
      ${ui.button('الدخول للوحة التحكم', '#')}
      ${ui.text('إذا واجهت أي مشكلة، لا تتردد في التواصل مع فريق الدعم.')}
    `,
  });
}

function welcomeUser({ name, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  const sName = branding.storeName || 'المتجر';
  return baseLayout({
    title: `مرحباً بك في ${sName}`,
    branding,
    content: `
      ${ui.icon('👋')}
      ${ui.heading(`مرحباً ${name || ''}!`)}
      ${ui.text(`شكراً لتسجيلك في ${ui.highlight(sName)}. نحن سعداء بانضمامك!`)}
      ${ui.text('حسابك جاهز الآن على المنصة. يمكنك:')}
      ${ui.text('• تصفح القوالب الاحترافية المتاحة')}
      ${ui.text('• اختيار القالب المناسب لمشروعك')}
      ${ui.text('• شراء قالب والحصول على متجرك الخاص وموقعك الإلكتروني')}
      ${ui.button('استكشف القوالب', '#')}
    `,
  });
}

function welcomeCustomer({ name, storeName, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  const sName = storeName || branding.storeName || 'متجرنا';
  return baseLayout({
    title: `مرحباً بك في ${sName}`,
    branding,
    content: `
      ${ui.icon('🛍️')}
      ${ui.heading(`مرحباً ${name || ''}!`)}
      ${ui.text(`شكراً لتسجيلك في ${ui.highlight(sName)}. نحن سعداء بانضمامك!`)}
      ${ui.text('حسابك جاهز الآن. يمكنك:')}
      ${ui.text('• تصفح المنتجات والخدمات')}
      ${ui.text('• إضافة منتجات لسلة التسوق')}
      ${ui.text('• متابعة طلباتك ومدفوعاتك')}
      ${ui.button('ابدأ التسوق', '#')}
    `,
  });
}

function passwordReset({ name, resetLink, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'إعادة تعيين كلمة المرور',
    branding,
    content: `
      ${ui.icon('🔑')}
      ${ui.heading('إعادة تعيين كلمة المرور')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('تم طلب إعادة تعيين كلمة المرور لحسابك.')}
      ${ui.text('اضغط على الزر أدناه لإعادة تعيين كلمة المرور:')}
      ${ui.button('إعادة تعيين كلمة المرور', resetLink || '#')}
      ${ui.divider()}
      ${ui.text('⏰ هذا الرابط صالح لمدة ساعة واحدة فقط.')}
      ${ui.text('إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة.')}
    `,
  });
}

function emailVerification({ name, code, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'تأكيد البريد الإلكتروني',
    branding,
    content: `
      ${ui.icon('✉️')}
      ${ui.heading('تأكيد بريدك الإلكتروني')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('استخدم الرمز التالي لتأكيد بريدك الإلكتروني:')}
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;padding:16px 40px;background:rgba(255,255,255,0.05);border:2px dashed rgba(255,255,255,0.1);border-radius:12px;font-size:32px;font-weight:800;color:#fff;letter-spacing:8px;">${code || '------'}</span>
      </div>
      ${ui.text('⏰ هذا الرمز صالح لمدة 10 دقائق فقط.')}
    `,
  });
}

function loginAlert({ name, ip, device, time, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'تنبيه تسجيل دخول',
    branding,
    content: `
      ${ui.icon('🔐')}
      ${ui.heading('تسجيل دخول جديد')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('تم تسجيل دخول جديد لحسابك:')}
      ${ui.infoTable(
        ui.infoRow('العنوان IP', ip || 'غير معروف') +
        ui.infoRow('الجهاز', device || 'غير معروف') +
        ui.infoRow('الوقت', time || new Date().toLocaleString('ar-SA'))
      )}
      ${ui.text('إذا لم تقم بتسجيل الدخول، قم بتغيير كلمة المرور فوراً.')}
      ${ui.button('تغيير كلمة المرور', '#')}
    `,
  });
}

function accountBlocked({ name, reason, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'تعليق الحساب',
    branding,
    content: `
      ${ui.icon('⚠️')}
      ${ui.heading('تم تعليق حسابك')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('تم تعليق حسابك بشكل مؤقت.')}
      ${reason ? ui.text(`السبب: ${ui.highlight(reason)}`) : ''}
      ${ui.divider()}
      ${ui.text('إذا كان لديك أي استفسار، تواصل مع فريق الدعم.')}
    `,
  });
}

function accountUnblocked({ name, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'إعادة تفعيل الحساب',
    branding,
    content: `
      ${ui.icon('✅')}
      ${ui.heading('تم إعادة تفعيل حسابك!')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('يسرنا إبلاغك بأنه تم إعادة تفعيل حسابك بنجاح.')}
      ${ui.text('يمكنك الآن تسجيل الدخول والوصول لجميع خدماتك.')}
      ${ui.button('تسجيل الدخول', '#')}
    `,
  });
}


// ═══════════════════════════════════
//  ORDER TEMPLATES
// ═══════════════════════════════════

function orderConfirmation({ name, orderId, items, total, currency, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  const itemsHtml = (items || []).map(item =>
    ui.infoRow(item.name || item.product_name || 'منتج', `${item.quantity || 1}x — ${currency || '$'}${item.price || 0}`)
  ).join('');

  return baseLayout({
    title: 'تأكيد الطلب',
    branding,
    content: `
      ${ui.icon('🛍️')}
      ${ui.heading('تم تأكيد طلبك!')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`تم استلام طلبك رقم ${ui.highlight('#' + (orderId || ''))} بنجاح.`)}
      ${items?.length ? `
        <h3 style="color:#e5e7eb;font-size:14px;margin:20px 0 8px;">تفاصيل الطلب:</h3>
        ${ui.infoTable(itemsHtml + ui.infoRow('<strong>الإجمالي</strong>', `<strong>${currency || '$'}${total || 0}</strong>`))}
      ` : ''}
      ${ui.text('سنقوم بإشعارك فور تحديث حالة طلبك.')}
    `,
  });
}

function newOrderAlert({ orderId, customerName, total, currency, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'طلب جديد',
    branding,
    content: `
      ${ui.icon('🛒')}
      ${ui.heading('طلب جديد!')}
      ${ui.text('تم استلام طلب جديد على متجرك:')}
      ${ui.infoTable(
        ui.infoRow('رقم الطلب', '#' + (orderId || '')) +
        ui.infoRow('العميل', customerName || 'غير معروف') +
        ui.infoRow('المبلغ', `${currency || '$'}${total || 0}`)
      )}
      ${ui.button('عرض الطلب', '#')}
    `,
  });
}

function orderStatusUpdate({ name, orderId, status, statusLabel, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  const statusEmojis = {
    processing: '⏳',
    completed: '✅',
    cancelled: '❌',
    refunded: '💸',
    shipped: '📦',
  };
  const statusColors = {
    processing: '#f59e0b',
    completed: '#10b981',
    cancelled: '#ef4444',
    refunded: '#8b5cf6',
    shipped: '#3b82f6',
  };

  return baseLayout({
    title: 'تحديث الطلب',
    branding,
    content: `
      ${ui.icon(statusEmojis[status] || '📋')}
      ${ui.heading('تحديث حالة الطلب')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`تم تحديث حالة طلبك رقم ${ui.highlight('#' + (orderId || ''))}:`)}
      <div style="text-align:center;margin:20px 0;">
        ${ui.badge(statusLabel || status, statusColors[status] || branding.primaryColor || '#7c3aed')}
      </div>
      ${status === 'completed' ? ui.text('🎉 شكراً لتسوقك معنا! نتمنى أن تكون راضياً عن تجربتك.') : ''}
      ${status === 'refunded' ? ui.text('💰 تم استرجاع المبلغ إلى حسابك. قد يستغرق الأمر 3-5 أيام عمل.') : ''}
      ${status === 'cancelled' ? ui.text('إذا كان لديك أي استفسار حول الإلغاء، تواصل مع الدعم.') : ''}
    `,
  });
}


// ═══════════════════════════════════
//  PAYMENT TEMPLATES
// ═══════════════════════════════════

function paymentReceipt({ name, amount, currency, method, transactionId, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'إيصال الدفع',
    branding,
    content: `
      ${ui.icon('💳')}
      ${ui.heading('إيصال الدفع')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('تمت عملية الدفع بنجاح!')}
      ${ui.infoTable(
        ui.infoRow('المبلغ', `${currency || '$'}${amount || 0}`) +
        ui.infoRow('طريقة الدفع', method || '-') +
        ui.infoRow('رقم العملية', transactionId || '-') +
        ui.infoRow('التاريخ', new Date().toLocaleDateString('ar-SA'))
      )}
      ${ui.text('احتفظ بهذا الإيصال كمرجع لعملية الدفع.')}
    `,
  });
}

function paymentFailed({ name, amount, currency, reason, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'فشل الدفع',
    branding,
    content: `
      ${ui.icon('❌')}
      ${ui.heading('فشل عملية الدفع')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`فشلت محاولة الدفع بمبلغ ${ui.highlight(`${currency || '$'}${amount || 0}`)}:`)}
      ${reason ? ui.text(`السبب: ${reason}`) : ''}
      ${ui.divider()}
      ${ui.text('يرجى المحاولة مرة أخرى أو استخدام طريقة دفع مختلفة.')}
      ${ui.button('إعادة المحاولة', '#')}
    `,
  });
}

function paymentInstructions({ name, method, amount, currency, details, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'تعليمات الدفع',
    branding,
    content: `
      ${ui.icon('📋')}
      ${ui.heading('تعليمات الدفع')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`لإتمام عملية الدفع بمبلغ ${ui.highlight(`${currency || '$'}${amount || 0}`)} عبر ${ui.highlight(method || 'التحويل')}:`)}
      ${details ? `<div style="${ui.accentBg()}border-radius:12px;padding:20px;margin:16px 0;">
        <pre style="margin:0;color:#d1d5db;font-size:13px;white-space:pre-wrap;font-family:monospace;">${details}</pre>
      </div>` : ''}
      ${ui.text('⏰ يرجى إتمام الدفع خلال 24 ساعة لتجنب إلغاء الطلب.')}
      ${ui.text('بعد الدفع، قم بتأكيد العملية من حسابك أو أرسل الإيصال.')}
    `,
  });
}

function bankReceiptReview({ orderId, customerName, amount, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'مراجعة إيصال بنكي',
    branding,
    content: `
      ${ui.icon('📎')}
      ${ui.heading('إيصال بنكي بحاجة مراجعة')}
      ${ui.text('تم رفع إيصال تحويل بنكي بحاجة للمراجعة:')}
      ${ui.infoTable(
        ui.infoRow('رقم الطلب', '#' + (orderId || '')) +
        ui.infoRow('العميل', customerName || '-') +
        ui.infoRow('المبلغ', `$${amount || 0}`)
      )}
      ${ui.button('مراجعة الإيصال', '#')}
      ${ui.text('يرجى التحقق من صحة الإيصال وتأكيد الدفع.')}
    `,
  });
}


// ═══════════════════════════════════
//  TICKET (SUPPORT) TEMPLATES
// ═══════════════════════════════════

function newTicket({ ticketId, ticketSubject, customerName, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'تذكرة دعم جديدة',
    branding,
    content: `
      ${ui.icon('🎫')}
      ${ui.heading('تذكرة دعم جديدة')}
      ${ui.text('تم إنشاء تذكرة دعم جديدة:')}
      ${ui.infoTable(
        ui.infoRow('رقم التذكرة', '#' + (ticketId || '')) +
        ui.infoRow('الموضوع', ticketSubject || '-') +
        ui.infoRow('العميل', customerName || '-')
      )}
      ${ui.button('عرض التذكرة', '#')}
    `,
  });
}

function ticketReply({ name, ticketId, message, replierName, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'رد على تذكرة',
    branding,
    content: `
      ${ui.icon('💬')}
      ${ui.heading(`رد جديد على تذكرة #${ticketId || ''}`)}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`قام ${ui.highlight(replierName || 'فريق الدعم')} بالرد على تذكرتك:`)}
      <div style="background:rgba(255,255,255,0.03);${ui.accentBorder()}border-radius:0 12px 12px 0;padding:16px 20px;margin:16px 0;">
        <p style="margin:0;color:#d1d5db;font-size:14px;line-height:1.7;">${message || ''}</p>
      </div>
      ${ui.button('عرض التذكرة', '#')}
    `,
  });
}

function ticketClosed({ name, ticketId, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'تم إغلاق التذكرة',
    branding,
    content: `
      ${ui.icon('✅')}
      ${ui.heading(`تم إغلاق التذكرة #${ticketId || ''}`)}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('تم إغلاق تذكرة الدعم الخاصة بك.')}
      ${ui.text('إذا كنت بحاجة لأي مساعدة إضافية، يمكنك فتح تذكرة جديدة في أي وقت.')}
      ${ui.divider()}
      ${ui.text('نتمنى أن تكون قد حصلت على المساعدة المطلوبة! 🙏')}
    `,
  });
}


// ═══════════════════════════════════
//  SITE & SUBSCRIPTION TEMPLATES
// ═══════════════════════════════════

function siteCreated({ name, siteName, siteKey, domain, plan, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'تم إنشاء موقعك',
    branding,
    content: `
      ${ui.icon('🚀')}
      ${ui.heading('تم إنشاء موقعك بنجاح!')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`تهانينا! تم إنشاء موقعك "${ui.highlight(siteName || '')}" بنجاح.`)}
      ${ui.infoTable(
        ui.infoRow('اسم الموقع', siteName || '-') +
        ui.infoRow('مفتاح الموقع', siteKey || '-') +
        ui.infoRow('النطاق', domain || '-') +
        ui.infoRow('الخطة', plan || 'تجريبية')
      )}
      ${ui.button('الدخول للوحة التحكم', '#')}
      ${ui.divider()}
      ${ui.text('خطواتك التالية:')}
      ${ui.text('1️⃣ تخصيص مظهر موقعك وألوانه')}
      ${ui.text('2️⃣ إضافة منتجاتك أو خدماتك')}
      ${ui.text('3️⃣ ربط بوابة الدفع')}
      ${ui.text('4️⃣ نشر الموقع ومشاركة رابطك')}
    `,
  });
}

function trialStarted({ name, siteName, trialDays, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'بدء الفترة التجريبية',
    branding,
    content: `
      ${ui.icon('🕐')}
      ${ui.heading('بدأت الفترة التجريبية!')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`تم تفعيل فترة تجريبية مدتها ${ui.highlight(`${trialDays || 14} يوم`)} لموقعك "${ui.highlight(siteName || '')}".`)}
      ${ui.text('استمتع بجميع الميزات المتاحة خلال هذه الفترة:')}
      ${ui.text('✅ جميع القوالب متاحة')}
      ${ui.text('✅ عدد غير محدود من المنتجات')}
      ${ui.text('✅ جميع بوابات الدفع')}
      ${ui.text('✅ دعم فني كامل')}
      ${ui.button('استكشف الآن', '#')}
    `,
  });
}

function trialExpiring({ name, siteName, daysLeft, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'الفترة التجريبية تنتهي قريباً',
    branding,
    content: `
      ${ui.icon('⚠️')}
      ${ui.heading('الفترة التجريبية تنتهي قريباً!')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`تنتهي الفترة التجريبية لموقعك "${ui.highlight(siteName || '')}" خلال ${ui.highlight(`${daysLeft || 3} أيام`)}.`)}
      ${ui.text('للاستمرار في استخدام كل الميزات بدون انقطاع، قم بترقية اشتراكك الآن:')}
      ${ui.button('ترقية الاشتراك', '#')}
      ${ui.divider()}
      ${ui.text('بعد انتهاء الفترة التجريبية، سيتم تعليق الموقع مؤقتاً حتى يتم تفعيل اشتراك.')}
    `,
  });
}

function trialExpired({ name, siteName, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'انتهت الفترة التجريبية',
    branding,
    content: `
      ${ui.icon('⏰')}
      ${ui.heading('انتهت الفترة التجريبية')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`انتهت الفترة التجريبية لموقعك "${ui.highlight(siteName || '')}".`)}
      ${ui.text('تم تعليق موقعك مؤقتاً. لإعادة تفعيله، اختر خطة اشتراك مناسبة:')}
      ${ui.button('تفعيل اشتراك', '#')}
      ${ui.divider()}
      ${ui.text('📌 بياناتك آمنة ومحفوظة — لن يتم حذف أي شيء.')}
    `,
  });
}

function subscriptionRenewed({ name, plan, nextBilling, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'تم تجديد الاشتراك',
    branding,
    content: `
      ${ui.icon('✅')}
      ${ui.heading('تم تجديد اشتراكك!')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('تم تجديد اشتراكك بنجاح.')}
      ${ui.infoTable(
        ui.infoRow('الخطة', plan || '-') +
        ui.infoRow('التجديد القادم', nextBilling || '-')
      )}
      ${ui.text('شكراً لثقتك بنا! استمتع بكل ميزات المنصة. 🎉')}
    `,
  });
}

function subscriptionCancelled({ name, expiresAt, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  return baseLayout({
    title: 'إلغاء الاشتراك',
    branding,
    content: `
      ${ui.icon('😔')}
      ${ui.heading('تم إلغاء اشتراكك')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text('تم إلغاء اشتراكك بنجاح.')}
      ${expiresAt ? ui.text(`سيظل موقعك نشطاً حتى: ${ui.highlight(expiresAt)}`) : ''}
      ${ui.divider()}
      ${ui.text('يمكنك إعادة تفعيل اشتراكك في أي وقت.')}
      ${ui.text('نتمنى أن تعود قريباً! 🙏')}
      ${ui.button('إعادة تفعيل الاشتراك', '#')}
    `,
  });
}


// ═══════════════════════════════════
//  WALLET TEMPLATE
// ═══════════════════════════════════

function walletUpdated({ name, oldBalance, newBalance, currency, branding = {} }) {
  const ui = createUI(branding.primaryColor);
  const diff = (newBalance || 0) - (oldBalance || 0);
  const isDeposit = diff >= 0;

  return baseLayout({
    title: 'تحديث المحفظة',
    branding,
    content: `
      ${ui.icon(isDeposit ? '💰' : '💸')}
      ${ui.heading('تحديث رصيد المحفظة')}
      ${ui.text(`مرحباً ${name || ''},`)}
      ${ui.text(`تم ${isDeposit ? 'إضافة' : 'خصم'} ${ui.highlight(`${currency || '$'}${Math.abs(diff).toFixed(2)}`)} ${isDeposit ? 'إلى' : 'من'} محفظتك.`)}
      ${ui.infoTable(
        ui.infoRow('الرصيد السابق', `${currency || '$'}${(oldBalance || 0).toFixed(2)}`) +
        ui.infoRow('التغيير', `${isDeposit ? '+' : '-'}${currency || '$'}${Math.abs(diff).toFixed(2)}`) +
        ui.infoRow('الرصيد الحالي', `<strong>${currency || '$'}${(newBalance || 0).toFixed(2)}</strong>`)
      )}
    `,
  });
}


// ═══════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════

module.exports = {
  // Auth
  welcomeAdmin,
  welcomeUser,
  welcomeCustomer,
  passwordReset,
  emailVerification,
  loginAlert,
  accountBlocked,
  accountUnblocked,
  // Orders
  orderConfirmation,
  newOrderAlert,
  orderStatusUpdate,
  // Payments
  paymentReceipt,
  paymentFailed,
  paymentInstructions,
  bankReceiptReview,
  // Tickets
  newTicket,
  ticketReply,
  ticketClosed,
  // Site & Subscriptions
  siteCreated,
  trialStarted,
  trialExpiring,
  trialExpired,
  subscriptionRenewed,
  subscriptionCancelled,
  // Wallet
  walletUpdated,
};
