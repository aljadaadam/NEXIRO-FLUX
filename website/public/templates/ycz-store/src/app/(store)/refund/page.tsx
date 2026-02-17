'use client';

import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import { ArrowRight, Ban, AlertTriangle, ShieldX, Eye, Wallet, Mail } from 'lucide-react';

export default function RefundPage() {
  const { currentTheme, storeName, t, isRTL } = useTheme();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Back */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', marginBottom: 16 }}>
        <ArrowRight size={16} /> {t('العودة للرئيسية')}
      </Link>

      {/* Banner */}
      <div style={{ borderRadius: 20, background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <Ban size={32} color="#fff" style={{ marginBottom: 8 }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('سياسة الاسترجاع')}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{t('آخر تحديث: فبراير 2026')}</p>
      </div>

      {/* Main Notice */}
      <div style={{ background: '#fef2f2', borderRadius: 16, padding: '1.25rem', border: '1px solid #fecaca', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fee2e2', color: '#ef4444', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <ShieldX size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', marginBottom: 6 }}>{t('⚠️ المنتجات الرقمية غير قابلة للاسترجاع')}</h3>
            <p style={{ fontSize: '0.84rem', color: '#7f1d1d', lineHeight: 1.8 }}>
              {t('نظراً لطبيعة المنتجات والخدمات الرقمية، فإن جميع عمليات الشراء نهائية وغير قابلة للاسترجاع بعد تنفيذ الخدمة أو تسليم المنتج.')}
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Notice */}
      <div style={{ background: '#fffbeb', borderRadius: 16, padding: '1.25rem', border: '1px solid #fde68a', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Wallet size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400e', marginBottom: 6 }}>{t('💰 رصيد المحفظة غير قابل للسحب')}</h3>
            <p style={{ fontSize: '0.84rem', color: '#78350f', lineHeight: 1.8 }}>
              {t('شحن المحفظة يُضاف كرصيد للاستخدام داخل المنصة فقط، ولا يمكن سحب الرصيد إلى البنك أو تحويله خارج المنصة مرة أخرى.')}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center' }}><Eye size={20} /></div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020' }}>{t('متى يمكن الاسترجاع؟')}</h3>
          </div>
          <ul style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 2, paddingInlineStart: '1.25rem', margin: 0 }}>
            <li>{t('إذا لم يتم تنفيذ الخدمة أو تسليم المنتج بسبب خطأ تقني من المنصة')}</li>
            <li>{t('إذا تم خصم المبلغ أكثر من مرة بسبب خطأ في بوابة الدفع (الخصم المكرر فقط)')}</li>
            <li>{t('إذا كانت الخدمة المقدمة مختلفة تماماً عن الوصف المعروض')}</li>
          </ul>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fee2e2', color: '#ef4444', display: 'grid', placeItems: 'center' }}><AlertTriangle size={20} /></div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020' }}>{t('حالات لا يتم فيها الاسترجاع')}</h3>
          </div>
          <ul style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 2, paddingInlineStart: '1.25rem', margin: 0 }}>
            <li>{t('بعد تنفيذ الخدمة بنجاح وتسليم النتيجة')}</li>
            <li>{t('تغيير رأي العميل بعد الشراء')}</li>
            <li>{t('رصيد المحفظة المشحون — لا يمكن سحبه إلى البنك')}</li>
            <li>{t('عدم قراءة وصف الخدمة أو المنتج قبل الشراء')}</li>
          </ul>
        </div>
      </div>

      {/* Contact */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9', marginTop: 16, textAlign: 'center' }}>
        <Mail size={20} color={currentTheme.primary} style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{t('لأي استفسارات حول سياسة الاسترجاع، تواصل معنا عبر صفحة الدعم.')}</p>
        <Link href="/support" style={{ color: currentTheme.primary, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>{t('مركز الدعم ←')}</Link>
      </div>
    </div>
  );
}
