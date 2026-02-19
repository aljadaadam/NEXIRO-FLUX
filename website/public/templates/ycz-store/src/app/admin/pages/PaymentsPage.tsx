'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';

type GatewayType = 'paypal' | 'bank_transfer' | 'usdt' | 'binance' | 'wallet' | 'bankak';

interface Gateway {
  id: number;
  type: GatewayType;
  name: string;
  name_en?: string;
  is_enabled: boolean;
  is_default: boolean;
  config: Record<string, string>;
  display_order: number;
}

const GATEWAY_META: Record<GatewayType, { icon: string; label: string; labelEn: string; desc: string }> = {
  binance: { icon: '🟡', label: 'Binance Pay', labelEn: 'Binance Pay', desc: 'دفع عبر العملات الرقمية' },
  paypal: { icon: '🔵', label: 'PayPal', labelEn: 'PayPal', desc: 'بطاقات ائتمان و PayPal' },
  bank_transfer: { icon: '🏦', label: 'التحويل البنكي', labelEn: 'Bank Transfer', desc: 'تحويل بنكي مباشر' },
  usdt: { icon: '💚', label: 'USDT', labelEn: 'USDT Crypto', desc: 'تيثر على شبكة Tron/ERC20/BEP20' },
  wallet: { icon: '📱', label: 'محفظة إلكترونية', labelEn: 'E-Wallet', desc: 'شحن عبر محافظ إلكترونية (تعليمات فقط)' },
  bankak: { icon: '🏛️', label: 'بنكك', labelEn: 'Bankak', desc: 'دفع عبر بنكك — تحويل محلي بسعر الصرف' },
};

const CONFIG_FIELDS: Record<GatewayType, { key: string; label: string; type?: string; placeholder: string; required?: boolean; options?: { value: string; label: string }[] }[]> = {
  paypal: [
    { key: 'client_id', label: 'Client ID', placeholder: 'AX...', required: true },
    { key: 'secret', label: 'Secret', type: 'password', placeholder: 'EL...', required: true },
    { key: 'email', label: 'بريد PayPal', placeholder: 'email@example.com', required: true },
    { key: 'mode', label: 'الوضع', placeholder: 'sandbox', required: true, options: [{ value: 'sandbox', label: 'Sandbox (تجريبي)' }, { value: 'live', label: 'Live (حقيقي)' }] },
  ],
  binance: [
    { key: 'api_key', label: 'API Key', placeholder: 'مفتاح الـ API', required: true },
    { key: 'api_secret', label: 'API Secret', type: 'password', placeholder: 'السر', required: true },
    { key: 'binance_id', label: 'Binance ID', placeholder: 'رقم حساب Binance', required: true },
    { key: 'binance_email', label: 'البريد (اختياري)', placeholder: 'binance@email.com' },
  ],
  usdt: [
    { key: 'wallet_address', label: 'عنوان المحفظة', placeholder: 'T...', required: true },
    { key: 'network', label: 'الشبكة', placeholder: 'TRC20', required: true, options: [{ value: 'TRC20', label: 'TRC20 (Tron)' }, { value: 'ERC20', label: 'ERC20 (Ethereum)' }, { value: 'BEP20', label: 'BEP20 (BSC)' }] },
    { key: 'api_key', label: 'مفتاح API (اختياري)', placeholder: 'مفتاح BscScan / Etherscan / TronGrid', type: 'password' },
  ],
  bank_transfer: [
    { key: 'bank_name', label: 'اسم البنك', placeholder: 'مثال: البنك المركزي', required: true },
    { key: 'account_holder', label: 'اسم صاحب الحساب', placeholder: 'الاسم الكامل', required: true },
    { key: 'iban', label: 'IBAN / رقم الحساب', placeholder: 'IQ...', required: true },
    { key: 'currency', label: 'عملة الحساب', placeholder: 'USD', required: true, options: [{ value: 'USD', label: 'USD ($)' }, { value: 'IQD', label: 'IQD (د.ع)' }, { value: 'SAR', label: 'SAR (ر.س)' }, { value: 'EUR', label: 'EUR (€)' }] },
  ],
  wallet: [
    { key: 'instructions', label: 'تعليمات الشحن', placeholder: 'اكتب تعليمات الشحن عبر هذه المحفظة...', required: true, type: 'textarea' },
    { key: 'contact_numbers', label: 'أرقام التواصل للشحن', placeholder: 'مثال: 07701234567' },
    { key: 'image_url', label: 'رابط صورة/لوغو المحفظة', placeholder: 'https://example.com/logo.png' },
  ],
  bankak: [
    { key: 'account_number', label: 'رقم الحساب', placeholder: 'أدخل رقم الحساب البنكي', required: true },
    { key: 'full_name', label: 'الاسم الكامل (صاحب الحساب)', placeholder: 'مثال: أحمد محمد علي', required: true },
    { key: 'exchange_rate', label: 'سعر الصرف (1 دولار = ؟ عملة محلية)', placeholder: 'مثال: 1480', required: true },
    { key: 'local_currency', label: 'رمز العملة المحلية', placeholder: 'مثال: IQD', required: true, options: [{ value: 'IQD', label: 'IQD (د.ع)' }, { value: 'SYP', label: 'SYP (ل.س)' }, { value: 'EGP', label: 'EGP (ج.م)' }, { value: 'LBP', label: 'LBP (ل.ل)' }, { value: 'YER', label: 'YER (ر.ي)' }, { value: 'SDG', label: 'SDG (ج.س)' }] },
  ],
};

const AVAILABLE_TYPES: GatewayType[] = ['paypal', 'binance', 'usdt', 'bank_transfer', 'wallet', 'bankak'];

export default function PaymentsPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGw, setEditingGw] = useState<Gateway | null>(null);
  const [formType, setFormType] = useState<GatewayType>('paypal');
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formConfig, setFormConfig] = useState<Record<string, string>>({});
  const [formDefault, setFormDefault] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGateways = useCallback(async () => {
    try {
      const res = await adminApi.getPaymentGateways();
      setGateways(res.gateways || []);
    } catch (err) {
      console.error(err);
      showToast('فشل في جلب بوابات الدفع', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGateways(); }, [fetchGateways]);

  const openAddModal = () => {
    setEditingGw(null);
    setFormType('paypal');
    setFormName(GATEWAY_META.paypal.label);
    setFormNameEn(GATEWAY_META.paypal.labelEn);
    setFormConfig({});
    setFormDefault(false);
    setShowModal(true);
  };

  const openEditModal = (gw: Gateway) => {
    setEditingGw(gw);
    setFormType(gw.type);
    setFormName(gw.name);
    setFormNameEn(gw.name_en || '');
    setFormConfig(gw.config || {});
    setFormDefault(gw.is_default);
    setShowModal(true);
  };

  const handleTypeChange = (type: GatewayType) => {
    setFormType(type);
    if (!editingGw) {
      setFormName(GATEWAY_META[type].label);
      setFormNameEn(GATEWAY_META[type].labelEn);
    }
    setFormConfig({});
  };

  const handleSave = async () => {
    if (!formName.trim()) { showToast('اسم البوابة مطلوب', 'error'); return; }
    setSaving(true);
    try {
      const data = {
        type: formType,
        name: formName.trim(),
        name_en: formNameEn.trim() || undefined,
        config: formConfig,
        is_default: formDefault,
      };
      if (editingGw) {
        await adminApi.updatePaymentGateway(editingGw.id, data);
        showToast('تم تحديث البوابة بنجاح');
      } else {
        await adminApi.createPaymentGateway(data);
        showToast('تم إضافة البوابة بنجاح');
      }
      setShowModal(false);
      fetchGateways();
    } catch (err) {
      console.error(err);
      showToast('فشل في حفظ البوابة', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (gw: Gateway) => {
    // تحقق من اكتمال الحقول قبل التفعيل
    if (!gw.is_enabled) {
      const requiredFields = (CONFIG_FIELDS[gw.type] || []).filter(f => f.required);
      const missing = requiredFields.filter(f => !gw.config?.[f.key]?.trim());
      if (missing.length > 0) {
        showToast(`أكمل الحقول المطلوبة أولاً: ${missing.map(f => f.label).join('، ')}`, 'error');
        return;
      }
    }
    try {
      const res = await adminApi.togglePaymentGateway(gw.id);
      if (res.error) {
        showToast(res.error, 'error');
        return;
      }
      setGateways(prev => prev.map(g => g.id === gw.id ? { ...g, is_enabled: !g.is_enabled } : g));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل في تبديل الحالة';
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deletePaymentGateway(id);
      setGateways(prev => prev.filter(g => g.id !== id));
      setDeleteConfirm(null);
      showToast('تم حذف البوابة');
    } catch (err) {
      console.error(err);
      showToast('فشل في حذف البوابة', 'error');
    }
  };

  const fields = CONFIG_FIELDS[formType] || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#7c5cff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1020' }}>💳 بوابات الدفع <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>({gateways.length})</span></h2>
        <button onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.25rem', borderRadius: 10, background: '#7c5cff', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          + إضافة بوابة
        </button>
      </div>

      {/* Empty State */}
      {gateways.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>💳</p>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>لا توجد بوابات دفع</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 20 }}>أضف بوابة دفع لتتمكن من استقبال المدفوعات من العملاء</p>
          <button onClick={openAddModal} style={{ padding: '0.65rem 1.5rem', borderRadius: 10, background: '#7c5cff', color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
            + إضافة أول بوابة
          </button>
        </div>
      )}

      {/* Gateway Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {gateways.map(gw => {
          const meta = GATEWAY_META[gw.type] || { icon: '💳', label: gw.type, desc: '' };
          return (
            <div key={gw.id} style={{
              background: '#fff', borderRadius: 16, padding: '1.5rem',
              border: gw.is_enabled ? '1px solid #f1f5f9' : '1px solid #fee2e2',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              opacity: gw.is_enabled ? 1 : 0.7,
              transition: 'all 0.2s',
            }}>
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0b1020' }}>{gw.name}</h4>
                      {gw.is_default && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: '#dbeafe', color: '#2563eb', fontWeight: 700 }}>افتراضي</span>}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{meta.desc}</p>
                  </div>
                </div>
                {/* Toggle */}
                <button onClick={() => handleToggle(gw)} style={{
                  width: 40, height: 22, borderRadius: 11, border: 'none',
                  background: gw.is_enabled ? '#22c55e' : '#e2e8f0',
                  position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2, transition: 'all 0.2s',
                    ...(gw.is_enabled ? { left: 2 } : { right: 2 }),
                  }} />
                </button>
              </div>

              {/* Config Preview */}
              <div style={{ marginBottom: 14 }}>
                {(() => {
                  const requiredFields = (CONFIG_FIELDS[gw.type] || []).filter(f => f.required);
                  const missing = requiredFields.filter(f => !gw.config?.[f.key]?.trim());
                  if (missing.length > 0) {
                    return (
                      <div style={{ padding: '0.5rem 0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 8, fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>
                        ⚠️ حقول ناقصة: {missing.map(f => f.label).join('، ')}
                      </div>
                    );
                  }
                  return null;
                })()}
                {gw.type === 'paypal' && gw.config?.email && (
                  <ConfigRow label="البريد" value={gw.config.email} />
                )}
                {gw.type === 'paypal' && gw.config?.mode && (
                  <ConfigRow label="الوضع" value={gw.config.mode === 'live' ? '🟢 حقيقي' : '🟡 تجريبي'} />
                )}
                {gw.type === 'binance' && gw.config?.binance_id && (
                  <ConfigRow label="Binance ID" value={gw.config.binance_id} />
                )}
                {gw.type === 'usdt' && (
                  <>
                    {gw.config?.network && <ConfigRow label="الشبكة" value={gw.config.network} />}
                    {gw.config?.wallet_address && <ConfigRow label="المحفظة" value={maskString(gw.config.wallet_address)} />}
                  </>
                )}
                {gw.type === 'bank_transfer' && (
                  <>
                    {gw.config?.bank_name && <ConfigRow label="البنك" value={gw.config.bank_name} />}
                    {gw.config?.iban && <ConfigRow label="IBAN" value={maskString(gw.config.iban)} />}
                  </>
                )}
                {gw.type === 'wallet' && (
                  <>
                    {gw.config?.instructions && <ConfigRow label="التعليمات" value={gw.config.instructions.length > 40 ? gw.config.instructions.slice(0, 40) + '...' : gw.config.instructions} />}
                    {gw.config?.contact_numbers && <ConfigRow label="التواصل" value={gw.config.contact_numbers} />}
                    {gw.config?.image_url && (
                      <div style={{ textAlign: 'center', marginTop: 4 }}>
                        <img src={gw.config.image_url} alt="" style={{ maxWidth: 80, maxHeight: 40, borderRadius: 6, border: '1px solid #e2e8f0' }} onError={e => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                  </>
                )}
                {gw.type === 'bankak' && (
                  <>
                    {gw.config?.full_name && <ConfigRow label="صاحب الحساب" value={gw.config.full_name} />}
                    {gw.config?.account_number && <ConfigRow label="رقم الحساب" value={maskString(gw.config.account_number)} />}
                    {gw.config?.exchange_rate && <ConfigRow label="سعر الصرف" value={`1$ = ${gw.config.exchange_rate} ${gw.config.local_currency || ''}`} />}
                  </>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEditModal(gw)} style={{
                  flex: 1, padding: '0.5rem', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                  fontFamily: 'Tajawal, sans-serif', color: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                  ✏️ تعديل
                </button>
                <button onClick={() => setDeleteConfirm(gw.id)} style={{
                  padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #fecaca',
                  background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                  fontFamily: 'Tajawal, sans-serif', color: '#dc2626',
                }}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '92%', maxWidth: 520, boxShadow: '0 25px 50px rgba(0,0,0,0.15)', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0b1020' }}>
                {editingGw ? '✏️ تعديل بوابة الدفع' : '➕ إضافة بوابة دفع'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '1rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Gateway Type */}
              {!editingGw && (
                <div>
                  <label style={labelStyle}>نوع البوابة</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {AVAILABLE_TYPES.map(t => (
                      <button key={t} onClick={() => handleTypeChange(t)} style={{
                        padding: '0.7rem 0.5rem', borderRadius: 10, textAlign: 'center',
                        border: formType === t ? '2px solid #7c5cff' : '1px solid #e2e8f0',
                        background: formType === t ? '#f5f3ff' : '#fff',
                        cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s',
                      }}>
                        <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: 4 }}>{GATEWAY_META[t].icon}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: formType === t ? '#7c5cff' : '#334155' }}>{GATEWAY_META[t].label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>الاسم (عربي)</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="اسم البوابة" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>الاسم (إنجليزي)</label>
                  <input value={formNameEn} onChange={e => setFormNameEn(e.target.value)} placeholder="Gateway Name" style={inputStyle} />
                </div>
              </div>

              {/* Config Fields */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 10 }}>⚙️ إعدادات {GATEWAY_META[formType].label}</label>
                <div style={{ padding: '1rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {fields.map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        {field.label}
                        {field.required && <span style={{ color: '#dc2626', marginRight: 2 }}> *</span>}
                      </label>
                      {field.options ? (
                        <select
                          value={formConfig[field.key] || field.options[0]?.value || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          style={inputStyle}
                        >
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formConfig[field.key] || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          rows={4}
                          style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 80 }}
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={formConfig[field.key] || ''}
                          onChange={e => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          style={inputStyle}
                        />
                      )}
                      {field.key === 'image_url' && formConfig.image_url && (
                        <div style={{ marginTop: 8, textAlign: 'center' }}>
                          <img src={formConfig.image_url} alt="معاينة" style={{ maxWidth: 120, maxHeight: 60, borderRadius: 8, border: '1px solid #e2e8f0' }} onError={e => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Default Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 10 }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0b1020' }}>بوابة افتراضية</p>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ستكون الأولى في قائمة الدفع</p>
                </div>
                <button onClick={() => setFormDefault(!formDefault)} style={{
                  width: 42, height: 24, borderRadius: 12, border: 'none',
                  background: formDefault ? '#7c5cff' : '#e2e8f0',
                  position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', ...(formDefault ? { left: 3 } : { right: 3 }) }} />
                </button>
              </div>

              {/* Save Button */}
              <button onClick={handleSave} disabled={saving} style={{
                padding: '0.75rem', borderRadius: 10, background: saving ? '#94a3b8' : '#7c5cff',
                color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {saving ? '⏳ جاري الحفظ...' : editingGw ? '💾 حفظ التعديلات' : '💾 إضافة البوابة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setDeleteConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '90%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</p>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b1020', marginBottom: 8 }}>حذف بوابة الدفع؟</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>هذا الإجراء لا يمكن التراجع عنه</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif', color: '#64748b' }}>إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, border: 'none', background: '#dc2626', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif', color: '#fff' }}>نعم، احذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="dash-toast" style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2000, padding: '0.7rem 1.5rem', borderRadius: 12,
          background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#16a34a' : '#dc2626',
          fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          animation: 'slideUp 0.3s ease',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </>
  );
}

/* ─── Helpers ─── */

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.75rem', background: '#f8fafc', borderRadius: 8, marginBottom: 6, fontSize: '0.78rem' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#334155', direction: 'ltr' }}>{value}</span>
    </div>
  );
}

function maskString(str: string): string {
  if (str.length <= 8) return str;
  return str.slice(0, 4) + '••••' + str.slice(-4);
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 1rem', borderRadius: 10,
  border: '1px solid #e2e8f0', fontSize: '0.85rem',
  fontFamily: 'Tajawal, sans-serif', outline: 'none', boxSizing: 'border-box',
  background: '#fff',
};
