'use client';

import { useState, useEffect } from 'react';
import { Save, Mail, DollarSign, Shield, Eye, EyeOff, Globe, Headphones, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ColorTheme } from '@/lib/themes';
import { useAdminLang } from '@/providers/AdminLanguageProvider';

export default function SettingsAdminPage({ theme, isActive }: { theme: ColorTheme; isActive?: boolean }) {
  const { t, isRTL } = useAdminLang();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Email/SMTP
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  // Currency
  const [secondaryCurrency, setSecondaryCurrency] = useState('');
  const [currencyRate, setCurrencyRate] = useState('');

  // OTP
  const [otpEnabled, setOtpEnabled] = useState(false);

  // Language
  const [storeLanguage, setStoreLanguage] = useState<'ar' | 'en'>('ar');

  // Contact / Support
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  // Admin Slug (unique admin URL)
  const [adminSlug, setAdminSlug] = useState('');
  const [slugCopied, setSlugCopied] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  useEffect(() => {
    if (!isActive) return;
    async function load() {
      try {
        const res = await adminApi.getSettings();
        const c = res?.customization;
        if (c) {
          setSmtpHost(c.smtp_host || '');
          setSmtpPort(String(c.smtp_port || '587'));
          setSmtpUser(c.smtp_user || '');
          setSmtpPass(c.smtp_pass || '');
          setSecondaryCurrency(c.secondary_currency || '');
          setCurrencyRate(c.currency_rate ? String(c.currency_rate) : '');
          setOtpEnabled(Boolean(c.otp_enabled));
          setStoreLanguage(c.store_language === 'en' ? 'en' : 'ar');
          setSupportEmail(c.support_email || '');
          setSupportPhone(c.support_phone || '');
          setAdminSlug(c.admin_slug || '');
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [isActive]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await adminApi.updateSettings({
        smtp_host: smtpHost || null,
        smtp_port: smtpPort ? parseInt(smtpPort) : null,
        smtp_user: smtpUser || null,
        smtp_pass: smtpPass || null,
        secondary_currency: secondaryCurrency || null,
        currency_rate: currencyRate ? parseFloat(currencyRate) : null,
        otp_enabled: otpEnabled,
        store_language: storeLanguage,
        support_email: supportEmail || null,
        support_phone: supportPhone || null,
      });
      setSaved(true);
      setToast({ msg: `✅ ${t('تم حفظ الإعدادات بنجاح')}`, type: 'ok' });
      setTimeout(() => { setSaved(false); setToast(null); }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('حدث خطأ أثناء الحفظ');
      setToast({ msg: `❌ ${msg}`, type: 'err' });
      setTimeout(() => setToast(null), 4000);
    }
    finally { setSaving(false); }
  }

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: '0.85rem',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const,
  };
  const labelStyle = { display: 'block' as const, fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6 };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>{t('جاري التحميل...')}</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>⚙️ {t('الإعدادات')}</h2>
        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.55rem 1.25rem', borderRadius: 10,
          background: saved ? '#16a34a' : theme.primary, color: '#fff',
          border: 'none', fontSize: '0.82rem', fontWeight: 700,
          cursor: saving ? 'wait' : 'pointer', fontFamily: 'Tajawal, sans-serif',
          opacity: saving ? 0.7 : 1, transition: 'background 0.3s',
        }}>
          <Save size={14} />
          {saving ? t('جاري الحفظ...') : saved ? t('✓ تم الحفظ') : t('حفظ الإعدادات')}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ─── تنبيه SMTP ─── */}
        {!smtpHost && (
          <div style={{
            padding: '1rem 1.25rem', borderRadius: 12,
            background: '#fffbeb', border: '1px solid #fde68a',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e', marginBottom: 4 }}>{t('البريد الإلكتروني غير مُعدّ')}</p>
              <p style={{ fontSize: '0.78rem', color: '#a16207', lineHeight: 1.6 }}>
                {t('لن يتم إرسال أي رسائل بريدية (تأكيد الطلبات، كود التحقق، إشعارات الدفع) حتى تقوم بإعداد SMTP.')}
                <br />{t('يمكنك استخدام خدمات مثل Gmail SMTP أو Mailgun أو أي مزود بريد إلكتروني.')}
              </p>
            </div>
          </div>
        )}

        {/* ─── toast ─── */}
        {toast && (
          <div style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
            padding: '0.7rem 1.5rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700,
            background: toast.type === 'ok' ? '#f0fdf4' : '#fef2f2',
            color: toast.type === 'ok' ? '#16a34a' : '#dc2626',
            border: `1px solid ${toast.type === 'ok' ? '#bbf7d0' : '#fecaca'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontFamily: 'Tajawal, sans-serif',
          }}>
            {toast.msg}
          </div>
        )}

        {/* ─── إعدادات البريد الإلكتروني ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
              <Mail size={18} color="#3b82f6" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{t('إعدادات البريد الإلكتروني (SMTP)')}</h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('لإرسال رسائل التأكيد والإشعارات للزبائن')}</p>
            </div>
            {smtpHost && smtpUser ? (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: 8, border: '1px solid #bbf7d0' }}>{t('✓ مُعدّ')}</span>
            ) : (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: 8, border: '1px solid #fecaca' }}>{t('✗ غير مُعدّ')}</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>{t('سيرفر SMTP (Host)')}</label>
              <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="mail.example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('المنفذ (Port)')}</label>
              <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('اسم المستخدم')}</label>
              <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="user@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('كلمة المرور')}</label>
              <div style={{ position: 'relative' }}>
                <input value={smtpPass} onChange={e => setSmtpPass(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="••••••••" style={inputStyle} />
                <button onClick={() => setShowPass(!showPass)} type="button" style={{ position: 'absolute', [isRTL ? 'left' : 'right']: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ─── إعدادات العملة ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'grid', placeItems: 'center' }}>
              <DollarSign size={18} color="#16a34a" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{t('إعدادات العملة')}</h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('العملة الأساسية هي الدولار (USD). يمكنك إضافة عملة ثانوية للعرض')}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>{t('العملة الثانوية')}</label>
              <select value={secondaryCurrency} onChange={e => setSecondaryCurrency(e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                <option value="">{t('بدون عملة ثانوية')}</option>
                <option value="SAR">{t('ريال سعودي (SAR)')}</option>
                <option value="AED">{t('درهم إماراتي (AED)')}</option>
                <option value="EGP">{t('جنيه مصري (EGP)')}</option>
                <option value="KWD">{t('دينار كويتي (KWD)')}</option>
                <option value="QAR">{t('ريال قطري (QAR)')}</option>
                <option value="BHD">{t('دينار بحريني (BHD)')}</option>
                <option value="OMR">{t('ريال عماني (OMR)')}</option>
                <option value="JOD">{t('دينار أردني (JOD)')}</option>
                <option value="IQD">{t('دينار عراقي (IQD)')}</option>
                <option value="TRY">{t('ليرة تركية (TRY)')}</option>
                <option value="EUR">{t('يورو (EUR)')}</option>
                <option value="GBP">{t('جنيه إسترليني (GBP)')}</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('سعر تحويل الدولار')}</label>
              <input value={currencyRate} onChange={e => setCurrencyRate(e.target.value)} placeholder="مثال: 3.75" type="number" step="0.01" style={inputStyle} disabled={!secondaryCurrency} />
              {secondaryCurrency && currencyRate && (
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                  $1 USD = {currencyRate} {secondaryCurrency}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── إعدادات اللغة ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f9ff', display: 'grid', placeItems: 'center' }}>
              <Globe size={18} color="#0ea5e9" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{t('إعدادات اللغة')}</h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('لغة واجهة المتجر للزبائن')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setStoreLanguage('ar')}
              style={{
                flex: 1, padding: '1rem', borderRadius: 12,
                border: `2px solid ${storeLanguage === 'ar' ? theme.primary : '#e2e8f0'}`,
                background: storeLanguage === 'ar' ? `${theme.primary}10` : '#f8fafc',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🇸🇦</div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: storeLanguage === 'ar' ? theme.primary : '#334155', marginBottom: 2 }}>{t('واجهة عربية (RTL)')}</p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('الواجهة الافتراضية')}</p>
            </button>
            <button
              onClick={() => setStoreLanguage('en')}
              style={{
                flex: 1, padding: '1rem', borderRadius: 12,
                border: `2px solid ${storeLanguage === 'en' ? theme.primary : '#e2e8f0'}`,
                background: storeLanguage === 'en' ? `${theme.primary}10` : '#f8fafc',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🇺🇸</div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: storeLanguage === 'en' ? theme.primary : '#334155', marginBottom: 2 }}>{t('واجهة إنجليزية (LTR)')}</p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>English Interface</p>
            </button>
          </div>
        </div>

        {/* ─── بيانات التواصل والدعم ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#faf5ff', display: 'grid', placeItems: 'center' }}>
              <Headphones size={18} color="#8b5cf6" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{t('بيانات التواصل والدعم')}</h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('تظهر في صفحة الدعم للزبائن')}</p>
            </div>
            {supportEmail || supportPhone ? (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: 8, border: '1px solid #bbf7d0' }}>{t('✓ مُعدّ')}</span>
            ) : (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: 8, border: '1px solid #fecaca' }}>{t('✗ غير مُعدّ')}</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>{t('بريد الدعم (Email)')}</label>
              <input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="support@example.com" type="email" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('رقم واتساب / اتصال')}</label>
              <input value={supportPhone} onChange={e => setSupportPhone(e.target.value)} placeholder="+964 7701234567" style={inputStyle} />
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>{t('اكتب الرقم بالصيغة الدولية لربطه بالواتساب')}</p>
            </div>
          </div>
        </div>

        {/* ─── إعدادات الأمان ─── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'grid', placeItems: 'center' }}>
              <Shield size={18} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{t('إعدادات الأمان')}</h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('إعدادات حماية حسابات الزبائن')}</p>
            </div>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: 12,
            border: '1px solid #f1f5f9',
          }}>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1020', marginBottom: 4 }}>{t('تفعيل كود التحقق (OTP)')}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>
                {t('عند التفعيل، يُطلب من الزبائن إدخال كود تحقق يُرسل عبر البريد الإلكتروني')}
                <br />{t('عند تسجيل الدخول من جهاز جديد أو بعد فترة انقطاع')}
              </p>
            </div>
            <button onClick={() => setOtpEnabled(!otpEnabled)} style={{
              width: 50, height: 28, borderRadius: 14,
              background: otpEnabled ? '#16a34a' : '#e2e8f0',
              border: 'none', cursor: 'pointer',
              position: 'relative', transition: 'background 0.3s', flexShrink: 0, [isRTL ? 'marginRight' : 'marginLeft']: 8,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, transition: 'all 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                ...(otpEnabled ? { [isRTL ? 'left' : 'right']: 4 } : { [isRTL ? 'right' : 'left']: 4 }),
              }} />
            </button>
          </div>
          {otpEnabled && !smtpHost && (
            <div style={{ marginTop: 10, padding: '0.6rem 1rem', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.78rem', color: '#b91c1c', fontWeight: 600 }}>
              ⚠️ {t('يجب إعداد البريد الإلكتروني (SMTP) أولاً لتفعيل كود التحقق')}
            </div>
          )}
        </div>

        {/* ─── رابط لوحة التحكم الفريد ─── */}
        {adminSlug && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'grid', placeItems: 'center' }}>
                <LinkIcon size={18} color="#10b981" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0b1020' }}>{t('رابط لوحة التحكم')}</h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('رابط فريد للوصول إلى لوحة التحكم — لا تشاركه مع أحد')}</p>
              </div>
            </div>
            <div style={{
              padding: '0.9rem 1rem', background: '#f8fafc', borderRadius: 12,
              border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <code dir="ltr" style={{
                flex: 1, fontSize: '0.78rem', color: '#334155', fontFamily: 'monospace',
                overflowX: 'auto', whiteSpace: 'nowrap',
              }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/admin?key=${adminSlug}` : ''}
              </code>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/admin?key=${adminSlug}`;
                  navigator.clipboard.writeText(url);
                  setSlugCopied(true);
                  setTimeout(() => setSlugCopied(false), 2000);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none',
                  background: slugCopied ? '#dcfce7' : '#f1f5f9',
                  color: slugCopied ? '#16a34a' : '#64748b',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                {slugCopied ? <Check size={13} /> : <Copy size={13} />}
                {slugCopied ? t('تم النسخ') : t('نسخ')}
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 8, fontWeight: 600 }}>
              ⚠️ {t('هذا الرابط هو الطريقة الوحيدة للوصول إلى لوحة التحكم. الدخول من /admin مباشرة لن يعمل.')}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
